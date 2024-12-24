/// <reference path="../.astro/types.d.ts" />

declare const Android: {
  onModuleStartTrigger(uri: string): void;
  onRestartAppTrigger(): void;

  onUnhandledException(e: string): void;

  onModuleDownloadStartTrigger(): void;
  onSetModuleDownloadDetails(moduleName: string, fileSize: string): void;
  onModuleDownloadProgress(val: number): void;
  onModuleDownloadComplete(): void;
  onModuleDownloadSuccess(): void;
  onModuleDownloadFail(): void;

  onModuleInstallStartTrigger(): void;
  onModuleInstallRetryTrigger(): void;
  onModuleInstallComplete(): void;
  onModuleInstallSuccess(): void;
  onModuleInstallFail(): void;

  onModuleLaunchStartTrigger(): void;
  onModuleLaunchFail(): void;
};
