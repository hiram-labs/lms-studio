import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware((context, next) => {
    // to get response run next() and collect output in a variable
    return next();
});