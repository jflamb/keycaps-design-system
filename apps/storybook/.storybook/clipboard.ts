/**
 * Storybook's docs copy buttons call `navigator.clipboard.writeText` and neither
 * handle its rejection nor fall back, so wherever the async Clipboard API is
 * unavailable the button silently does nothing: no copy, no error, and the label
 * never flips to "Copied". Measured here as
 * `NotAllowedError: Write permission denied` on a trusted click in a focused,
 * same-origin preview frame carrying `allow="clipboard-write"`.
 *
 * Wrapping `writeText` rather than intercepting the click keeps Storybook's own
 * success feedback intact — the promise still resolves — and adds the legacy
 * `execCommand` path, which needs only the user gesture the click already
 * provides. Nothing here ships in the packages; it is a documentation-site
 * repair for a documentation-site bug.
 */

function copyViaExecCommand(text: string): boolean {
  const selection = document.getSelection();
  const previousRange =
    selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.setAttribute("aria-hidden", "true");
  area.style.cssText =
    "position:fixed;top:0;left:0;inline-size:1px;block-size:1px;padding:0;border:0;opacity:0;pointer-events:none";
  document.body.append(area);

  let copied = false;
  try {
    area.select();
    area.setSelectionRange(0, text.length);
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  } finally {
    area.remove();
    // Put the reader's own selection back the way they left it.
    if (previousRange && selection) {
      selection.removeAllRanges();
      selection.addRange(previousRange);
    }
  }

  return copied;
}

export function installClipboardFallback() {
  const clipboard = navigator.clipboard;
  if (!clipboard?.writeText) return;

  const write = clipboard.writeText.bind(clipboard);

  try {
    clipboard.writeText = async (text: string) => {
      try {
        await write(text);
        return;
      } catch (error) {
        // Chrome's transient activation outlives the immediate rejection, so the
        // gesture that opened this path is still valid for execCommand.
        if (copyViaExecCommand(text)) return;
        throw error;
      }
    };
  } catch {
    // A runtime that seals `navigator.clipboard` keeps its own behavior.
  }
}
