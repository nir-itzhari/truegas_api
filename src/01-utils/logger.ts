import path from "path";
import fs from "fs";

// Log absolute file:
const logFile = path.resolve(__dirname, "../log.txt");

// Log a message:
function log(message: string, err?: any): void {
    const now = new Date();
    let msgToLog = now.toUTCString() + "\n";
    if (message) msgToLog += message + "\n";
    
    if (err instanceof Error) {
        msgToLog += `Message: ${err.message}\n`;
        msgToLog += `Stack: ${err.stack}\n`;
    } else if (typeof err === "string") {
        msgToLog += err + "\n"; // E.g. throw new "Blah..." in some internal library.
    }
    
    msgToLog += "----------------------------------------------------------------------------------------------------\n";
    
    fs.appendFile(logFile, msgToLog, (err) => {
        if (err) {
            console.error("Failed to write to log file:", err);
        }
    });
}

export default {
    log
};
