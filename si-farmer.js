/** @param {NS} ns */
export async function main(ns) {
	//Farms current host.
	//Configuration / Variables
	const scriptName = "si-farmer.js";
	const minFundsPercentage = 0.88;//Average Grow of < 11%
	const maxSecurityLevelsGained = 0.6;//Average security reduced by 3.52%(apx 0.5)
	const target = ns.getHostname();
	const moneyThresh = ns.getServerMaxMoney(target) * minFundsPercentage;
	const securityThresh = ns.getServerMinSecurityLevel(target) + maxSecurityLevelsGained;

	//Debugging Function(s)
	function dPrint(msg, prefix = "") {
		ns.print("" + prefix + msg);
		ns.tprint("" + prefix + msg);
	}

	//Parameters/Argument Sanitizing
	if (ns.args.length != 0) {
		dPrint(scriptName + " exited due to unexpected parameter(s).");
		dPrint("Usage:\n\trun " + scriptName);
		return;
	}

	//Execute Farm Loop
	while(true) {
        if (ns.getServerSecurityLevel(target) > securityThresh) {
            // If the server's security level is above our threshold, weaken it
            await ns.weaken(target);
        } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
            // If the server's money is less than our threshold, grow it
            await ns.grow(target);
        } else {
            // Otherwise, hack it
            await ns.hack(target);
        }
    }
}