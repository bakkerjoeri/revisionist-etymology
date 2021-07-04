#!/usr/bin/env node

import fs, { mkdirSync, watch } from 'fs';
import { micromark } from 'micromark';
import path from 'path';
import prettier from 'prettier';

const srcPath = './src';
const exportPath = './web';
const rulesetFilePath = path.join(srcPath, 'revisionist-etymology.md');

if (process.argv.includes('--watch')) {
	build();
	console.log('Watching for file changes...');
	watch('./src', { recursive: true }, (event) => {
		if (event === 'change') {
			build();
		}
	});
} else {
	build();
}

function clean() {
	if (fs.existsSync(exportPath)) {
		fs.rmSync(exportPath, { recursive: true });
	}
}

function build() {
	console.log('Building...');

	clean();
	mkdirSync(exportPath);

	const rulesetContents = fs.readFileSync(rulesetFilePath);
	const rulesetMarkedUp = micromark(rulesetContents, {allowDangerousHtml: true});

	const rulesetPrefixMarkup = `
	<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width,initial-scale=1.0">
			<link rel="stylesheet" href="style.css">
			<title>Revisionist Etymology</title>
		</head>

		<body>
	`;

	const rulesetPostfixMarkup = `
		</body>
	</html>
	`;

	const rulesetHtml = `${rulesetPrefixMarkup}${rulesetMarkedUp}${rulesetPostfixMarkup}`;
	fs.writeFileSync(path.join(exportPath, 'index.html'), prettier.format(rulesetHtml, { parser: 'html' }));
	fs.copyFileSync(path.join(srcPath, 'style.css'), path.join(exportPath, 'style.css'));

	console.log(`✨ Build finished: ${path.join(exportPath, 'index.html')}`);
}
