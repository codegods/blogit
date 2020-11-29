type ShareData = {
    title?: string;
    text?: string;
    url?: string;
};

// Apparently typescript has defined the navigator.share attribute
// as if it is always defined, which is not true. So, we need to
// override this definition for proper functioning.
//
// https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/957
interface Navigator {
    share?: (data?: ShareData) => Promise<void>;
}
