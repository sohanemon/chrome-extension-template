import html2canvas from "html2canvas";

console.log("[Node Screenshot] Content script loaded");

window.__nodeScreenshotActive = false;

if (!window.__nodeScreenshotInitialized) {
	window.__nodeScreenshotInitialized = true;
	chrome.runtime.onMessage.addListener((msg) => {
		if (msg.action === "startPicker") startPicker();
	});
}

function startPicker() {
	let hovered: Element | null = null;

	const highlight = document.createElement("div");
	Object.assign(highlight.style, {
		position: "fixed",
		pointerEvents: "none",
		border: "2px solid #6366f1",
		background: "rgba(99,102,241,0.08)",
		borderRadius: "3px",
		zIndex: "2147483646",
		transition: "all 0.08s ease",
		boxSizing: "border-box",
	});
	document.body.appendChild(highlight);

	const toast = document.createElement("div");
	toast.textContent =
		"🎯 Click — clipboard  ·  Ctrl+Click — download  ·  Esc to cancel";
	Object.assign(toast.style, {
		position: "fixed",
		bottom: "24px",
		left: "50%",
		transform: "translateX(-50%)",
		background: "#111",
		color: "#fff",
		padding: "10px 18px",
		borderRadius: "8px",
		fontSize: "13px",
		fontFamily: "system-ui, sans-serif",
		zIndex: "2147483647",
		pointerEvents: "none",
		whiteSpace: "nowrap",
		boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
	});
	document.body.appendChild(toast);

	const onMove = (e: MouseEvent) => {
		const el = document.elementFromPoint(e.clientX, e.clientY);
		if (!el || el === highlight || el === toast) return;
		hovered = el;
		const r = el.getBoundingClientRect();
		Object.assign(highlight.style, {
			top: r.top + "px",
			left: r.left + "px",
			width: r.width + "px",
			height: r.height + "px",
		});
	};

	const onClick = (e: MouseEvent) => {
		if (!hovered) return;
		e.preventDefault();
		e.stopPropagation();
		const download = e.ctrlKey;
		cleanup();
		capture(hovered as HTMLElement, download);
	};

	const onKey = (e: KeyboardEvent) => {
		if (e.key === "Escape") cleanup();
	};

	const cleanup = () => {
		document.removeEventListener("mousemove", onMove, true);
		document.removeEventListener("click", onClick, true);
		document.removeEventListener("keydown", onKey, true);
		highlight.remove();
		toast.remove();
		window.__nodeScreenshotActive = false;
	};

	document.addEventListener("mousemove", onMove, true);
	document.addEventListener("click", onClick, true);
	document.addEventListener("keydown", onKey, true);
}

async function capture(el: HTMLElement, download: boolean) {
	const toast = document.createElement("div");
	toast.textContent = "📸 Capturing…";
	Object.assign(toast.style, {
		position: "fixed",
		bottom: "24px",
		left: "50%",
		transform: "translateX(-50%)",
		background: "#111",
		color: "#fff",
		padding: "10px 18px",
		borderRadius: "8px",
		fontSize: "13px",
		fontFamily: "system-ui, sans-serif",
		zIndex: "2147483647",
		pointerEvents: "none",
		whiteSpace: "nowrap",
		boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
	});
	document.body.appendChild(toast);

	try {
		const canvas = await html2canvas(el, {
			useCORS: true,
			allowTaint: true,
			scale: window.devicePixelRatio || 2,
			backgroundColor: null,
			logging: false,
		});

		if (download) {
			const link = document.createElement("a");
			link.download = `screenshot-${Date.now()}.png`;
			link.href = canvas.toDataURL("image/png");
			link.click();
			toast.textContent = "✅ Downloaded!";
			setTimeout(() => toast.remove(), 2000);
		} else {
			canvas.toBlob(async (blob) => {
				if (!blob) return;
				try {
					await navigator.clipboard.write([
						new ClipboardItem({ "image/png": blob }),
					]);
					toast.textContent = "✅ Copied to clipboard!";
				} catch {
					toast.textContent = "❌ Clipboard denied (https required)";
				}
				setTimeout(() => toast.remove(), 2000);
			}, "image/png");
		}
	} catch (err) {
		toast.textContent = "❌ Capture failed";
		console.error("[Node Screenshot]", err);
		setTimeout(() => toast.remove(), 2000);
	}
}
