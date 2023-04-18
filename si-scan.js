/** @param {NS} ns */
export async function main(ns) {
	//Scans for targets, Copys self to targets, runs clones, runs si-pwn.js on targets.
	//Constants / Configuration
	const scriptName = "si-scan.js";
	const pwnScriptName = "si-pwn.js";
	const hostname = ns.getHostname();
	const ramRequired = ns.getScriptRam("" + scriptName, hostname);

	//Debugging Function(s)
	function dPrint(msg, prefix = "") {
		ns.print("" + prefix + msg);
		ns.tprint("" + prefix + msg);
	}

	//Parameters/Argument Sanitizing
	if (ns.args.length != 0) {
		dPrint(scriptName + " exited due to unexpected parameter(s).");
		dPrint("Usage:\n\trun " + scriptName + " targetservername");
		return;
	}

	//Scan for targets
	var targets = ns.scan(hostname);//1 Hop away
	//Filter out purchased servers from targets
	//* Disabled(?) as getPurchasedServers() is a Memory Hog!
	var purchased = ns.getPurchasedServers();
	purchased.push("home");
	purchased.push("" + hostname);
	for (var i = 0; i < purchased.length; i++)
		targets = targets.filter(function (x) { return x !== purchased[i]; });
	//*/

	//File Sync across all targets
	await ns.sleep(30000);
	var success = false;
	for (var i = 0; i < targets.length; i++) {
		if (ns.fileExists("" + scriptName, "" + targets[i])) {
			var killed = ns.scriptKill("" + scriptName, "" + targets[i]);//Terminate
			if (killed)
				dPrint("Killed instance of '" + scriptName + "' on target server '" + targets[i] + "'.");
			success = ns.rm("" + scriptName, "" + targets[i]);//Delete
			if (!success) {
				dPrint("Failed to remove remote script '" + scriptName + "' on target server '" + targets[i] + "'.");
				return;
			}
		}
		success = ns.scp("" + scriptName, "" + targets[i], ns.getHostname());
		if (!success) {
			dPrint("Failed to clone script '" + scriptName + "' via scp to target server: '" + targets[i] + "'. Aborting.");
			return;
		}
		dPrint("Finished Syncing " + scriptName + " from '" + hostname + "' via scp to target server: '" + targets[i] + "'.");
	}
	dPrint("All scanner scripts have been synced to all targets.");

	/* Disabled until I can figure it out.
	//Filter Available Remote scanners by RAM
	var scan_targets = [...targets];
	for (var i = 0; i < scan_targets.length; i++) {
		var ramCapacity = ns.getServerMaxRam("" + scan_targets[i]) - ns.getServerUsedRam("" + scan_targets[i]);
		if (ramRequired > ramCapacity) {
			dPrint("Target[" + i + "]: '" + scan_targets[i] + "' lacks the required RAM of " + ramRequired + "GB to run.");
			//scan_targets = scan_targets.splice(i, 1);//Doesn't work.
			scan_targets = scan_targets.filter(function (x) { return x !== scan_targets[i]; });
			i--;
		}
	}
	//Execute Remote Scan scripts
	for (var i = 0; i < scan_targets.length; i++) {
		ns.exec("" + scriptName, "" + scan_targets[i], 1);//, []
		dPrint("Initiated " + scriptName + " on target server '" + scan_targets[i] + "'.");
	}
	dPrint("All remote scanner scripts have been executed.");
	//*/

	//Run si-pwn on all targets.
	await ns.sleep(10000);
	for (var i = 0; i < targets.length; i++) {
		var pwnPID = ns.run("" + pwnScriptName, 1, "" + targets[i]);//Wrong: , ["" + targets[i]]
		dPrint("Running " + pwnScriptName + " against target: '" + targets[i] + "'.");
		while (ns.isRunning(pwnPID, hostname, "" + targets[i])) {
			//NOP until completed.
			await ns.sleep(1000);
		}
	}

	//Finished
	dPrint("All targets have been targeted. Exiting.");
}