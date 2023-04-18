/** @param {NS} ns */
export async function main(ns) {
    //Attempts gain root on target server.
    //Constants / Configuration
    const scriptName = "si-farmer.js";

    //Debugging Function(s)
    function dPrint(msg, prefix = "") {
        ns.print("" + prefix + msg);
        ns.tprint("" + prefix + msg);
    }

    //Arguments Sanitization
    if (ns.args.length != 1) {
        dPrint(scriptName + " exited due to missing parameter(s).");
        dPrint("Usage:\n\trun " + scriptName + " servername");
        return;
    }
    var target = ns.args[0]; // Defines the "target server"
    dPrint(scriptName + " has started with target server of: '" + target + "'.");

    // If we have the Port opening program(s), use it/them to open the target's Ports
    // on the target server. Required for NUKE.exe.
    if (ns.fileExists("BruteSSH.exe", "home")) {
        ns.brutessh(target);
    }
    if (ns.fileExists("FTPCrack.exe", "home")) {
        ns.ftpcrack(target);
    }
    if (ns.fileExists("relaySMTP.exe", "home")) {
        ns.relaysmtp(target);
    }
    if (ns.fileExists("HTTPWorm.exe", "home")) {
        ns.httpworm(target);
    }
    if (ns.fileExists("SQLInject.exe", "home")) {
        ns.sqlinject(target);
    }

    // Get root access to target server
    ns.nuke(target);
    var hasRoot = ns.hasRootAccess("" + target);
    if (hasRoot) {
        dPrint(scriptName + " was successful with target server of: '" + target + "'.");
    } else {
        dPrint(scriptName + " failed with target server of: '" + target + "'.");
    }
}