import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";

import "./App.css";

import TitleBar from "./TitleBar";

const toBoolean = (e) => (e !== 0);
const toInt = (e) => (e ? 1 : 0);

async function getRegistry(valueName) {
    const result = await invoke("read_registry", {
        hive: "HKCU",
        subkey: "Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize",
        valueName: valueName
    });
    return toBoolean(result);
}

async function setRegistry(valueName, data) {
    await invoke("set_registry", {
        hive: "HKCU",
        subkey: "Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize",
        valueName: valueName,
        data: toInt(data)
    });
}

async function broadcastChange() {   
    await invoke ("broadcast_theme_change");
}

export default function App() {
    const [appLight, setAppLight] = useState(null);
    const [systemLight, setSystemLight] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const [app, system] = await Promise.all([
                    getRegistry("AppsUseLightTheme"),
                    getRegistry("SystemUsesLightTheme")
                ]);
                setAppLight(app);
                setSystemLight(system);
            } catch (error) {
                console.log(error);
            }
        })();
    }, []);

    const handleAppClick = async () => {
        const nextState = !appLight;
        try {   
            await setRegistry("AppsUseLightTheme", nextState);
            setAppLight(nextState);
            await broadcastChange();
        } catch(error) {
            console.log("Registry write error:", error);
        }
    }

    const handleSystemClick = async () => {
        const nextState = !systemLight;
        try {   
            await setRegistry("SystemUsesLightTheme", nextState);
            setSystemLight(nextState);
            await broadcastChange();
        } catch(error) {
            console.log("Registry write error:", error);
        }
    }

    return (
        <>
            <TitleBar/>
            <div className="app-container" data-tauri-drag-region>
                <button 
                    className={`btn ${appLight ? "on" : "off"}`}
                    onClick={handleAppClick}
                    disabled={appLight === null}
                    data-tauri-drag-region="false"
                >
                    <div className="inside">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" preserveAspectRatio="xMidYMid">
                            <style>{`
                                .cls-1 {
                                    fill: none;
                                    stroke: #000;
                                    stroke-linecap: round;
                                    stroke-linejoin: round;
                                    stroke-width: 2px;
                                }
                            `}</style>
                            <path d="M57 5H7a1 1 0 0 0-1 1v28a1 1 0 0 0 1 1h50a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1zm-1 28H8V7h48z" fill="#1b1a1e"/>
                            <path d="M57 1H7a5.006 5.006 0 0 0-5 5v36a5.006 5.006 0 0 0 5 5h17v4H14a1 1 0 0 0-.894.553l-5 10A1 1 0 0 0 9 63h46a1 1 0 0 0 .894-1.447l-5-10A1 1 0 0 0 50 51H40v-4h17a5.006 5.006 0 0 0 5-5V6a5.006 5.006 0 0 0-5-5zM4 6a3.003 3.003 0 0 1 3-3h50a3.003 3.003 0 0 1 3 3v31H4zm34 46a6.007 6.007 0 0 0 6 6 1 1 0 0 0 0-2 3.996 3.996 0 0 1-3.858-3h9.24l4 8H10.618l4-8h9.24A3.996 3.996 0 0 1 20 56a1 1 0 0 0 0 2 6.007 6.007 0 0 0 6-6v-5h12zm22-10a3.003 3.003 0 0 1-3 3H7a3.003 3.003 0 0 1-3-3v-3h56z" fill="#1b1a1e"/>
                            <path d="M7 43h6a1 1 0 0 0 0-2H7a1 1 0 0 0 0 2zM16 43h2a1 1 0 0 0 0-2h-2a1 1 0 0 0 0 2z" fill="#1b1a1e"/>
                        </svg>
                    </div>
                </button>

                <button 
                    className={`btn ${systemLight ? "on" : "off"}`}
                    onClick={handleSystemClick}
                    disabled={systemLight === null}
                    data-tauri-drag-region="false"
                >
                    <div className="inside">
                        <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                                <path className="cls-1" d="M44 28v-8h-5.56A14.89 14.89 0 0 0 37 16.61l4-3.92L35.31 7l-3.92 4A14.89 14.89 0 0 0 28 9.56V4h-8v5.56A14.89 14.89 0 0 0 16.61 11l-3.92-4L7 12.69l4 3.92A14.89 14.89 0 0 0 9.56 20H4v8h5.56A14.89 14.89 0 0 0 11 31.39l-4 3.92L12.69 41l3.92-4A14.89 14.89 0 0 0 20 38.44V44h8v-5.56A14.89 14.89 0 0 0 31.39 37l3.92 4L41 35.31l-4-3.92A14.89 14.89 0 0 0 38.44 28z"/>
                                <circle className="cls-1" cx="24" cy="24" r="10"/>
                            <path className="cls-1" d="M-418-146h680v680h-680z"/>
                        </svg>
                    </div>
                </button>
            </div>
        </>
    )
}