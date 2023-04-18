/** @param {NS} ns */
export async function main(ns) {
	const minimumBalance = 200000;//Minimum amount of M1 to keep on hand.
	const targetHacknetCount = 8;//How many HackNet Nodes do I want?
	const targetHacknetLevel = 50;//What level do I want each node?
	const targetHacknetRAM   = 8;//How many GB of RAM should each node have?
	const targetHacknetCores = 4;//How many cores should each of those nodes have?
	ns.disableLog("getServerMoneyAvailable");
	function money() {
                return ns.getServerMoneyAvailable("home");
        }
	function canSpend(amount) {
		return money() - amount > minimumBalance;
	}
	ns.disableLog("sleep");
	async function purchaseNodes(targetCount, waitTimeMs = 3000) {
		//Blocking function
		while (ns.hacknet.numNodes() < targetCount) {
        	var res = ns.hacknet.purchaseNode();
        	if (res != -1)
				ns.print("Purchased hacknet Node with index: " + res + ".");
        	await ns.sleep(waitTimeMs);
		};
		ns.print("[INFO]: All " + targetCount + " nodes purchased if needed.");
		ns.tprint("[INFO]: All " + targetCount + " nodes purchased if needed.");
	}
	async function upgradeLevels(startNodeIDX, endNodeIDX, targetLevel, isBlocking, waitTimeMs = 3000) {
		var successFlag = true;
		for (var i = startNodeIDX; i < endNodeIDX; i++) {
			while (ns.hacknet.getNodeStats(i).level < targetLevel) {
				var cost = ns.hacknet.getLevelUpgradeCost(i, 1);
				if (isBlocking) {
					while (!canSpend(cost)) {
						//Wait until we have more money.
						ns.print("[WARN]: Level upgrade on " + i + " needs $" + (cost + minimumBalance) + ", has $" + money() + ".");
						await ns.sleep(waitTimeMs);
					}
				} else {
					if (!canSpend(cost)) {
						//Fail out.
			    		ns.print("[ERROR]: Level upgrade on " + i + " needs $" + (cost + minimumBalance) + ", has $" + money() + ".");
						successFlag = false;
						break;
					}
				}
				var res = ns.hacknet.upgradeLevel(i, 1);
			};
		};
		if (isBlocking) {
			ns.print( "[INFO]: All nodes in range " + startNodeIDX + "->" + endNodeIDX + " have had Level increased to at least: " + targetLevel + ".");
			ns.tprint("[INFO]: All nodes in range " + startNodeIDX + "->" + endNodeIDX + " have had Level increased to at least: " + targetLevel + ".");
		}
		return successFlag;
	}
	async function upgradeRAMs(startNodeIDX, endNodeIDX, targetRAM, isBlocking, waitTimeMs = 3000) {
		var successFlag = true;
		for (var i = startNodeIDX; i < endNodeIDX; i++) {
			while (ns.hacknet.getNodeStats(i).ram < targetRAM) {
				var cost = ns.hacknet.getRamUpgradeCost(i, 1);
				if (isBlocking) {
					while (!canSpend(cost)) {
						//Wait until we have more money.
						ns.print("[WARN]: RAM upgrade on: " + i + " needs $" + (cost + minimumBalance) + ", has $" + money() + ".");
						await ns.sleep(waitTimeMs);
					}
				} else {
					if (!canSpend(cost)) {
						//Fail out.
						ns.print("[ERROR]: RAM upgrade on " + i + " needs $" + (cost + minimumBalance) + ", has $" + money() + ".");
						successFlag = false;
						break;
					}
				}
				var res = ns.hacknet.upgradeRam(i, 1);
			};
		};
		if (isBlocking) {
			ns.print( "[INFO]: All nodes in range " + startNodeIDX + "->" + endNodeIDX + " have had RAM increased to at least: " + targetRAM + "GB.");
			ns.tprint("[INFO]: All nodes in range " + startNodeIDX + "->" + endNodeIDX + " have had RAM increased to at least: " + targetRAM + "GB.");
		}
		return successFlag;
	}
	async function upgradeCores(startNodeIDX, endNodeIDX, targetCores, isBlocking, waitTimeMs = 3000) {
		var successFlag = true;
		for (var i = startNodeIDX; i < endNodeIDX; i++) {
			while (ns.hacknet.getNodeStats(i).cores < targetCores) {
				var cost = ns.hacknet.getCoreUpgradeCost(i, 1);
				if (isBlocking) {
					while (!canSpend(cost)) {
						//Wait until we have more money.
						ns.print("[WARN]: Core upgrade on: " + i + " needs $" + (cost + minimumBalance) + ", has $" + money() + ".");
						await ns.sleep(waitTimeMs);
					}
				} else {
					if (!canSpend(cost)) {
						//Fail out.
						ns.print("[ERROR]: Core upgrade on " + i + " needs $" + (cost + minimumBalance) + ", has $" + money() + ".");
						successFlag = false;
						break;
					}
				}
				var res = ns.hacknet.upgradeCore(i, 1);
			};
		};
		if (isBlocking) {
			ns.print("[INFO]: All nodes in range " + startNodeIDX + "->" + endNodeIDX + " have had Core increased to at least: " + targetCores + " cores.");
			ns.tprint("[INFO]: All nodes in range " + startNodeIDX + "->" + endNodeIDX + " have had Core increased to at least: " + targetCores + " cores.");
		}
		return successFlag;
	}
	async function upgradeAll(isBlocking = true, waitTimeMs = 3000) {
		await upgradeLevels(0, targetHacknetCount, targetHacknetLevel, isBlocking, waitTimeMs);
		await upgradeRAMs(0, targetHacknetCount, targetHacknetRAM, isBlocking, waitTimeMs);
		await upgradeCores(0, targetHacknetCount, targetHacknetCores, isBlocking, waitTimeMs);
	}
	await purchaseNodes(targetHacknetCount);
	await upgradeAll();
	ns.print( "[INFO]: Script HacknetUpgrade.js has exited.");
	ns.tprint("[INFO]: Script HacknetUpgrade.js has exited.");
}
