import { useState } from "react";

function App() {
	const [status, setStatus] = useState<"idle" | "picking" | "done" | "error">(
		"idle",
	);
	const [error, setError] = useState<string>("");

	const startPicker = async () => {
		setStatus("picking");
		setError("");
		const [tab] = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});

		if (!tab?.id) {
			setError("No active tab");
			setStatus("error");
			return;
		}

		const url = tab.url || "";
		if (url.startsWith("chrome://") || url.startsWith("about:")) {
			setError("Not supported on this page");
			setStatus("error");
			return;
		}

		try {
			await chrome.tabs.sendMessage(tab.id, { action: "startPicker" });
			window.close();
		} catch {
			setError("Content script not loaded. Refresh the page and try again.");
			setStatus("error");
		}
	};

	return (
		<div className="w-80 p-6 space-y-6 bg-background">
			<div className="flex items-center gap-3">
				<span className="text-3xl">📸</span>
				<div>
					<h1 className="text-lg font-semibold">Node Screenshot</h1>
					<p className="text-sm text-muted-foreground">Capture any element</p>
				</div>
			</div>

			<button
				onClick={startPicker}
				disabled={status === "picking"}
				className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
			>
				{status === "picking" ? (
					<>
						<span className="animate-spin">⏳</span>
						Activating...
					</>
				) : (
					<>
						<span>🎯</span>
						Pick an element
					</>
				)}
			</button>

			<div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 space-y-3">
				<p className="text-sm font-medium">How to use</p>
				<div className="space-y-2 text-sm text-muted-foreground">
					<div className="flex items-center gap-2">
						<kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
							<span className="text-xs">↳</span> Click
						</kbd>
						<span>Copy to clipboard</span>
					</div>
					<div className="flex items-center gap-2">
						<kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
							<span>Ctrl</span>
						</kbd>
						<kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
							<span className="text-xs">↳</span> Click
						</kbd>
						<span>Download PNG</span>
					</div>
					<div className="flex items-center gap-2">
						<kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
							Esc
						</kbd>
						<span>Cancel</span>
					</div>
				</div>
			</div>

			{status === "error" && (
				<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
					{error}
				</div>
			)}
		</div>
	);
}

export default App;