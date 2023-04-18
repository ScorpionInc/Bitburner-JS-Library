/** @param {NS} ns */
export async function main(ns) {
	//Roots, Clones to, and then runs farm on Remote Server.
	//Constants / Configuration
	const scriptName = "si-pwn.js";
	const rooterScriptName = "si-rooter.js";
	const farmerScriptName = "si-farmer.js";
	const hostname = ns.getHostname();

	//Debugging Function(s)
	function dPrint(msg, prefix = "") {
		ns.print("" + prefix + msg);
		ns.tprint("" + prefix + msg);
	}

	//Parameters/Argument Sanitizing
	if (ns.args.length != 1) {
		dPrint(scriptName + " exited due to missing parameter(s).");
		dPrint("Usage:\n\trun " + scriptName + " targetservername");
		return;
	}
	var target = ns.args[0];
	if (!ns.serverExists(target)) {
		dPrint("Target server is invalid or doesn't exist: '" + target + "'.");
		return;
	}

	//Port Checks
	var targetRequiredPorts = ns.getServerNumPortsRequired("" + target);
	function listPortPrograms() {
		//Returns an array of available port programs.
		var arr = [];
		if (ns.fileExists("BruteSSH.exe", "home"))
			arr.push("BruteSSH.exe");
		if (ns.fileExists("FTPCrack.exe", "home"))
			arr.push("FTPCrack.exe");
		if (ns.fileExists("relaySMTP.exe", "home"))
			arr.push("relaySMTP.exe");
		if (ns.fileExists("HTTPWorm.exe", "home"))
			arr.push("HTTPWorm.exe");
		if (ns.fileExists("SQLInject.exe", "home"))
			arr.push("SQLInject.exe");
		return arr;
	}
	function countPortPrograms() {
		//Returns the numerical count of port opening programs available.
		return listPortPrograms().length;
	}
	var availablePortPrograms = countPortPrograms();
	dPrint("Available Port Programs : " + availablePortPrograms + ".");
	dPrint("Target Port Requirements: " + targetRequiredPorts + ".");
	if (availablePortPrograms < targetRequiredPorts) {
		dPrint("" + scriptName + " is exiting due to lack of required tools(" + (targetRequiredPorts - availablePortPrograms) + ").");
		return;
	}

	//Root Check
	var rooterPID = ns.run("" + rooterScriptName, 1, "" + target);
	while(ns.isRunning(rooterPID, hostname, "" + target)) {
		//NOP until completed.
		await ns.sleep(1000);
	}
	var hasRoot = ns.hasRootAccess("" + target);
	if (!hasRoot) {
		dPrint("rooter script: '" + rooterScriptName + "' has failed to get root access. Aborting.");
		return;
	}
	dPrint("Root Server access has been verified.");

	//File resync
	var success = false;
	if (ns.fileExists("" + scriptName, "" + target)) {
		ns.scriptKill("" + scriptName, "" + target);//Terminate
		success = ns.rm("" + scriptName, "" + target);//Delete
		if (!success) {
			dPrint("Failed to remove remote script '" + scriptName + "' on target server '" + target + "'.");
			return;
		}
	}
	success = ns.scp("" + scriptName, "" + target, ns.getHostname());
	if (!success) {
		dPrint("Failed to clone script '" + scriptName + "' via scp to target server: '" + target + "'. Aborting.");
		return;
	}
	if (ns.fileExists("" + rooterScriptName, "" + target)) {
		ns.scriptKill("" + rooterScriptName, "" + target);//Terminate
		success = ns.rm("" + rooterScriptName, "" + target);//Delete
		if (!success) {
			dPrint("Failed to remove remote rooter '" + rooterScriptName + "' on target server '" + target + "'.");
			return;
		}
	}
	success = ns.scp("" + rooterScriptName, "" + target, ns.getHostname());
	if (!success) {
		dPrint("Failed to clone rooter '" + rooterScriptName + "' via scp to target server: '" + target + "'. Aborting.");
		return;
	}
	if (ns.fileExists("" + farmerScriptName, "" + target)) {
		ns.scriptKill("" + farmerScriptName, "" + target);//Terminate
		success = ns.rm("" + farmerScriptName, "" + target);//Delete
		if (!success) {
			dPrint("Failed to remove remote farmer '" + farmerScriptName + "' on target server '" + target + "'.");
			return;
		}
	}
	success = ns.scp("" + farmerScriptName, "" + target, ns.getHostname());
	if (!success) {
		dPrint("Failed to clone farmer '" + farmerScriptName + "' via scp to target server: '" + target + "'. Aborting.");
		return;
	}
	dPrint("All script files sent to target via scp.");

	//Launch Farmer Script
	var ramRequirements = ns.getScriptRam("" + farmerScriptName, "" + target);
	var ramCapacity = ns.getServerMaxRam("" + target) - ns.getServerUsedRam("" + target);
	dPrint("Farmer RAM Requirements: " + ramRequirements + "GB / Target RAM Capacity: " + ramCapacity + "GB.");
	var scriptInstanceCount = Math.floor(ramCapacity / ramRequirements);
	if (scriptInstanceCount <= 0) {
		dPrint("Target server '" + target + "' lacks required RAM(" + ramRequirements + ") to run farmer script. Aborting.");
		return;
	}
	//await ns.sleep(2000);
	ns.exec("" + farmerScriptName, "" + target, scriptInstanceCount);
	dPrint("Launched farmer script '" + farmerScriptName + "' with [" + scriptInstanceCount + "] threads on target server '" + target + "'.");

	//Finished
	dPrint("All tasks have completed successfully. Exiting.");
}