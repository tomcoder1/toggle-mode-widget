import { getCurrentWindow } from "@tauri-apps/api/window";

import "./TitleBar.css";

export default function TitleBar() {
    return (
        <div className="title-bar" data-tauri-drag-region>
            <div className="right-section" data-tauri-drag-region="false">
                <button className="bton bton-minimize" onClick={() => getCurrentWindow().minimize()}>
                    &minus;
                </button>
                <button className="bton bton-close" onClick={() => getCurrentWindow().close()}>
                    &times;
                </button>
            </div>
        </div>
    );
}