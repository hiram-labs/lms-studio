import AdbWebCredentialStore from "@yume-chan/adb-credential-web";
import { PackageManager } from "@yume-chan/android-bin";
import { type ReadableWritablePair, Consumable } from "@yume-chan/stream-extra";
import { type AdbPacketData, type AdbPacketInit, Adb, AdbDaemonTransport } from "@yume-chan/adb";
import { AdbDaemonWebUsbDeviceManager, AdbDaemonWebUsbDevice } from "@yume-chan/adb-daemon-webusb";

import { wrapPromiseWithTimeout, fetchApkFileWithProgress, delay } from "../libs/utils";

interface ProgressStruct {
    stepElements: NodeListOf<HTMLElement>;
    stepCardVisibilityHandler(el: HTMLElement): void;
    stepCardErrorAlertHandler(el: HTMLElement, err: Error): void;
    success(el: HTMLElement): void;
    error(el: HTMLElement): void;
    reset(): void;
    complete(): void;
}

export function initializePipeInstaller(
    pkgName: string,
    pkgVersionCode: string,
    apkUrl: string
): void {
    const cta = document.getElementById("apk-install-cta");
    if (!cta) return;

    const progressStruct = createProgressStruct();
    const stepIds = extractStepIds(progressStruct);

    cta.addEventListener("click", async (e: Event) => {
        e.preventDefault();
        await handleInstallClick(
            progressStruct,
            stepIds,
            pkgName,
            pkgVersionCode,
            apkUrl
        );
    });
}

function createProgressStruct(): ProgressStruct {
    const stepElements = document.querySelectorAll<HTMLElement>("li.step");

    return {
        stepElements,
        stepCardVisibilityHandler(stepElement) {
            const stepId = stepElement.getAttribute("data-step-id");
            const stepCard = document.querySelector(
                `[data-step-cards][data-step-card-id=${stepId}]`
            );
            const stepCards = document.querySelectorAll("[data-step-cards]");
            stepCards.forEach((el) => el.classList.add("hidden"));
            stepCard?.classList.remove("hidden");
        },
        stepCardErrorAlertHandler(stepElement, err) {
            const stepId = stepElement.getAttribute("data-step-id");
            const stepCard = document.querySelector(
                `[data-step-cards][data-step-card-id=${stepId}]`
            );
            const stepErrorNameElement = stepCard?.querySelector(
                "[data-step-error-name]"
            ) as HTMLElement;
            stepErrorNameElement.textContent = err.name;
            const stepErrorMessageElement = stepCard?.querySelector(
                "[data-step-error-message]"
            ) as HTMLElement;
            stepErrorMessageElement.textContent = err.message;
            const stepErrorElements = stepCard?.querySelectorAll(
                "[data-step-error-group]"
            );
            stepErrorElements?.forEach((el) => {
                el.classList.toggle("hidden");
            });
        },
        success(stepElement) {
            stepElement.classList.add("step-warning");
            this.stepElements.forEach((el) => {
                el.classList.remove("step-error", "step-warning");
                el.removeAttribute("data-content");
                // if el comes before stepElement.
                if (
                    el.compareDocumentPosition(stepElement) &
                    Node.DOCUMENT_POSITION_FOLLOWING
                ) {
                    el.classList.add("step-success");
                    el.dataset.content = "✓";
                }
            });
            stepElement.classList.add("step-success");
            stepElement.dataset.content = "✓";
            stepElement.nextElementSibling?.classList.add("step-warning");
        },
        error(stepElement) {
            this.stepElements.forEach((el) => {
                // if el comes after stepElement.
                if (
                    el.compareDocumentPosition(stepElement) &
                    Node.DOCUMENT_POSITION_PRECEDING
                ) {
                    el.classList.remove("step-success", "step-error", "step-warning");
                    el.removeAttribute("data-content");
                }
            });
            stepElement.classList.add("step-error");
            stepElement.dataset.content = "✗";
        },
        reset() {
            this.stepElements.forEach((el) => {
                el.classList.remove("step-success", "step-error", "step-warning");
                el.removeAttribute("data-content");
            });
        },
        complete() {
            this.stepElements.forEach((el) => {
                el.classList.remove("step-error", "step-warning");
                el.classList.add("step-success");
                el.dataset.content = "✓";
            });
        },
    };
}

interface StepIds {
    CHECK_WEBUSB_SUPPORT: string | null;
    PROMPT_DEVICE_SELECTION: string | null;
    OPEN_CONNECTION: string | null;
    DOWNLOAD_APK: string | null;
    INSTALL_APK: string | null;
    CLOSE_CONNECTION: string | null;
}

function extractStepIds(progressStruct: ProgressStruct): StepIds {
    const [
        CHECK_WEBUSB_SUPPORT,
        PROMPT_DEVICE_SELECTION,
        OPEN_CONNECTION,
        DOWNLOAD_APK,
        INSTALL_APK,
        CLOSE_CONNECTION,
    ] = Array.from(progressStruct.stepElements).map((el) =>
        el.getAttribute("data-step-id")
    );

    return {
        CHECK_WEBUSB_SUPPORT,
        PROMPT_DEVICE_SELECTION,
        OPEN_CONNECTION,
        DOWNLOAD_APK,
        INSTALL_APK,
        CLOSE_CONNECTION,
    };
}

type ProgressStatus = "SUCCESS" | "ERROR" | "RESET" | "COMPLETE";

function progressNotification<T>(
    progressStruct: ProgressStruct,
    status: ProgressStatus,
    stepId?: string | null,
    callback?: (stepElement: HTMLElement) => Promise<T>
): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        let defaultReturnValue: T = {} as T;
        const stepElement = document.querySelector(
            `[data-step-id=${stepId}]`
        ) as HTMLElement;
        switch (status) {
            case "SUCCESS": {
                progressStruct.stepCardVisibilityHandler(stepElement);
                if (callback) {
                    callback(stepElement)
                        .then((ret) => {
                            progressStruct.success(stepElement);
                            resolve(ret);
                        })
                        .catch(reject);
                } else {
                    progressStruct.success(stepElement);
                    resolve(defaultReturnValue);
                }
                break;
            }
            case "ERROR": {
                progressStruct.stepCardVisibilityHandler(stepElement);
                if (callback) {
                    callback(stepElement)
                        .then((ret) => {
                            progressStruct.error(stepElement);
                            resolve(ret);
                        })
                        .catch(reject);
                } else {
                    progressStruct.error(stepElement);
                    resolve(defaultReturnValue);
                }
                break;
            }
            case "RESET": {
                const OnboardHeadsetWelcomeCard = document.createElement("div");
                OnboardHeadsetWelcomeCard.dataset.stepId = "onboarding-welcome";
                progressStruct.stepCardVisibilityHandler(
                    OnboardHeadsetWelcomeCard
                );
                if (callback) {
                    callback(stepElement)
                        .then((ret) => {
                            progressStruct.reset();
                            resolve(ret);
                        })
                        .catch(reject);
                } else {
                    progressStruct.reset();
                    resolve(defaultReturnValue);
                }
                break;
            }
            case "COMPLETE": {
                const OnboardHeadsetCompleteCard = document.createElement("div");
                OnboardHeadsetCompleteCard.dataset.stepId = "onboarding-complete";
                progressStruct.stepCardVisibilityHandler(
                    OnboardHeadsetCompleteCard
                );
                if (callback) {
                    callback(stepElement)
                        .then((ret) => {
                            progressStruct.complete();
                            resolve(ret);
                        })
                        .catch(reject);
                } else {
                    progressStruct.complete();
                    resolve(defaultReturnValue);
                }
                break;
            }
            default:
                const error = new Error(
                    `The progress notification status ${status} is not a recognised status type`
                );
                error.name = "UnknownProgressNotificationStatus";
                reject(error);
                break;
        }
    });
}

async function recordDeviceOnboarding(
    device: AdbDaemonWebUsbDevice
): Promise<void> {
    const recordResponse = await fetch("/api/misc-util", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            function: "record-device-onboarding",
            data: {
                device_serial: device.serial,
                device_model: device.raw.productName || "Unknown",
                device_manufacturer: device.raw.manufacturerName || "Unknown",
            },
        }),
    });
    const recordData = await recordResponse.json();
    if (!recordData.success) {
        const error = new Error("Failed to record device onboarding");
        error.name = "DeviceRecordingError";
        throw error;
    }
}

async function handleInstallClick(
    progressStruct: ProgressStruct,
    stepIds: StepIds,
    pkgName: string,
    pkgVersionCode: string,
    apkUrl: string
): Promise<void> {
    let manager: AdbDaemonWebUsbDeviceManager | undefined;
    let device: AdbDaemonWebUsbDevice | undefined;
    let connection: ReadableWritablePair<AdbPacketData, Consumable<AdbPacketInit>>;
    let transport: AdbDaemonTransport;
    let adb: Adb | undefined;
    const credentialStore: AdbWebCredentialStore = new AdbWebCredentialStore();
    const DEVICE_AUTH_TIMEOUT = 30000;

    try {
        manager = await progressNotification(
            progressStruct,
            "SUCCESS",
            stepIds.CHECK_WEBUSB_SUPPORT,
            async () => AdbDaemonWebUsbDeviceManager.BROWSER
        );
        if (!manager) {
            const error = new Error("WebUSB is not supported in this browser!");
            error.name = "WebUSBError";
            throw error;
        }

        device = await progressNotification(
            progressStruct,
            "SUCCESS",
            stepIds.PROMPT_DEVICE_SELECTION,
            async () => await manager!.requestDevice()
        );
        if (!device) {
            const error = new Error("Device selection dismissed by user!");
            error.name = "DeviceSelectionDismissed";
            throw error;
        }
        connection = await progressNotification(
            progressStruct,
            "SUCCESS",
            stepIds.PROMPT_DEVICE_SELECTION,
            async () => await device!.connect()
        );

        transport = await progressNotification(
            progressStruct,
            "SUCCESS",
            stepIds.OPEN_CONNECTION,
            async () =>
                await wrapPromiseWithTimeout(
                    AdbDaemonTransport.authenticate({
                        serial: device!.serial,
                        connection,
                        credentialStore,
                    }),
                    DEVICE_AUTH_TIMEOUT
                )
        );

        adb = new Adb(transport);
        const pm = new PackageManager(adb);

        await recordDeviceOnboarding(device!);

        const packages = pm.listPackages({ showVersionCode: true });
        for await (const pkg of packages) {
            if (
                pkg.packageName === pkgName &&
                (pkg.versionCode || Infinity) < parseInt(pkgVersionCode)
            ) {
                pm.uninstall(pkg.packageName);
            } else if (pkg.packageName === pkgName) {
                // Device is already properly onboarded
                await progressNotification(progressStruct, "COMPLETE");
                return;
            }
        }

        const { fileSize, file } = await progressNotification(
            progressStruct,
            "SUCCESS",
            stepIds.DOWNLOAD_APK,
            async (stepElement) =>
                await fetchApkFileWithProgress(apkUrl, (percentage) => {
                    const stepId = stepElement.getAttribute("data-step-id");
                    const downloadProgressElement = document.querySelector(
                        `[data-step-cards][data-step-card-id=${stepId}] .radial-progress`
                    ) as HTMLElement;
                    downloadProgressElement.style.setProperty(
                        "--value",
                        percentage.toString()
                    );
                    downloadProgressElement.textContent = `${percentage}%`;
                })
        );

        await progressNotification(
            progressStruct,
            "SUCCESS",
            stepIds.INSTALL_APK,
            async () => await pm.installStream(fileSize, file)
        );
        await progressNotification(
            progressStruct,
            "SUCCESS",
            stepIds.CLOSE_CONNECTION,
            async () => await delay(2500)
        );

        await progressNotification(progressStruct, "COMPLETE");
    } catch (error) {
        console.error("Onboarding failed:", error);
        // Device record remains as created, no need to update status

        if (error instanceof Error && error.name === "WebUSBError") {
            // the browser does not support webusb
            await progressNotification(
                progressStruct,
                "ERROR",
                stepIds.CHECK_WEBUSB_SUPPORT,
                async (stepElement) => {
                    progressStruct.stepCardErrorAlertHandler(stepElement, error);
                }
            );
        } else if (
            error instanceof Error &&
            error.name === "SecurityError"
        ) {
            // the device can only be requested in response to a click event (await promises in the onclick callback may cause this error)
            await progressNotification(
                progressStruct,
                "ERROR",
                stepIds.PROMPT_DEVICE_SELECTION,
                async (stepElement) => {
                    progressStruct.stepCardErrorAlertHandler(stepElement, error);
                }
            );
        } else if (error instanceof Error && error.name === "NetworkError") {
            // the device is in use by another application
            await progressNotification(
                progressStruct,
                "ERROR",
                stepIds.PROMPT_DEVICE_SELECTION,
                async (stepElement) => {
                    progressStruct.stepCardErrorAlertHandler(stepElement, error);
                }
            );
        } else if (
            error instanceof Error &&
            error.name === "DeviceSelectionDismissed"
        ) {
            // user cancelled device selection pop up [special case show no alert just reset onboarding]
            await progressNotification(
                progressStruct,
                "RESET",
                stepIds.PROMPT_DEVICE_SELECTION
            );
        } else if (error instanceof Error && error.name === "OperationTimeout") {
            // manual timeout for waiting for auth connection user may have to action popup in headset
            await progressNotification(
                progressStruct,
                "ERROR",
                stepIds.OPEN_CONNECTION,
                async (stepElement) => {
                    progressStruct.stepCardErrorAlertHandler(stepElement, error);
                }
            );
        } else if (error instanceof Error && error.name === "DeviceRecordingError") {
            // error recording device onboarding to server
            await progressNotification(
                progressStruct,
                "ERROR",
                stepIds.OPEN_CONNECTION,
                async (stepElement) => {
                    progressStruct.stepCardErrorAlertHandler(stepElement, error);
                }
            );
        } else if (error instanceof Error && error.name === "APKFetchError") {
            // downloading the apk file resulted in an error
            await progressNotification(
                progressStruct,
                "ERROR",
                stepIds.DOWNLOAD_APK,
                async (stepElement) => {
                    progressStruct.stepCardErrorAlertHandler(stepElement, error);
                }
            );
        } else if (
            error instanceof Error &&
            error.message.toLocaleLowerCase().includes("failed to fetch")
        ) {
            // error reaching the server hosting apk file [maybe CORS/TIMEOUT/SSL]
            await progressNotification(
                progressStruct,
                "ERROR",
                stepIds.DOWNLOAD_APK,
                async (stepElement) => {
                    progressStruct.stepCardErrorAlertHandler(stepElement, error);
                }
            );
        } else if (
            error instanceof Error &&
            error.message.toLocaleLowerCase().includes("install_failed_already_exists")
        ) {
            // error attempt to reinstall existing pkg without first uninstall
            await progressNotification(
                progressStruct,
                "ERROR",
                stepIds.INSTALL_APK,
                async (stepElement) => {
                    progressStruct.stepCardErrorAlertHandler(stepElement, error);
                }
            );
        } else {
            console.error(error);
            // TODO: create a directus endpoint to send this there
        }
    } finally {
        if (adb) await adb.close();
        if (manager)
            (await manager.getDevices()).map((device) => device.raw.forget());
    }
}
