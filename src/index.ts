// Import necessary Node.js modules
import glob from "glob";
import fs from "fs/promises"
import replaceInFiles from "replace-in-files";
import { settings } from './settings';

/**
 * parseFile
 * This function renames a file and replaces import paths within certain files
 */
async function parseFile(oldFilePath: string) {
	// Extract the old file name from the old file path
	const filePathArray = oldFilePath.split("/");
	const oldFileName = filePathArray[filePathArray.length - 1].split(".")[0];

	// If the old file name contains the ignore key, skip this file and return
	for (let ignoreKey of settings.ignoreKeys) {
		if (oldFileName.match(ignoreKey)) return;
	}

	// Refactor the file name to a new one
	const newFileName = oldFileName + "Refactored";

	// Replace the old file name with the new file name in the file path
	const newFilePath = oldFilePath.replace(oldFileName, newFileName);

	// Rename the old file with the new file name
	await fs.rename(oldFilePath, newFilePath);
	
	// Replace import paths within certain files
	await replaceImportPath({ oldImportPath: oldFileName, newImportPath: newFileName });
}

/**
 * replaceImportPath
 * This function replaces import paths within certain files
 */
async function replaceImportPath({ oldImportPath, newImportPath }: {oldImportPath: string; newImportPath: string;}) {
	// Replace import paths in all files that match certain patterns
	const { paths } = await replaceInFiles({
		files: settings.projectFilesPathGlob,
		from: new RegExp(oldImportPath, "g"),
		to: newImportPath,
		saveOldFile: false,
		onlyFindPathsWithoutReplace: false,
	});
	return paths;
}

/**
 * convert
 * This function finds all files within a certain directory and applies the parseFile function to them
 */
async function convert() {
	// Find all .ts files within a certain directory
	const files = await glob(settings.tsFilesGlob);
	// Apply the parseFile function to each file
	for (let file of files) {
		await parseFile(file);
	}
}

// Run the convert function
(async () => {
	await convert();
})();
