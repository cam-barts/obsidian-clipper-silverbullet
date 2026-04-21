import browser from './browser-polyfill';
import { sanitizeFileName } from '../utils/string-utils';
import { generateFrontmatter as generateFrontmatterCore } from './shared';
import { Template, Property } from '../types/types';
import { generalSettings } from './storage-utils';

export async function generateFrontmatter(properties: Property[]): Promise<string> {
	// SilverBullet uses standard YAML frontmatter — no property type mapping needed
	return generateFrontmatterCore(properties, {});
}

async function fetchProxy(url: string, options?: RequestInit & { headers?: Record<string, string> }): Promise<{ ok: boolean; status: number; text: string; error?: string }> {
	const response = await browser.runtime.sendMessage({
		action: 'fetchProxy',
		url,
		options
	});
	return response as { ok: boolean; status: number; text: string; error?: string };
}

function buildAuthHeader(): Record<string, string> {
	const auth = generalSettings.serverAuth;
	if (!auth) return {};
	return { Authorization: auth };
}

function buildPagePath(noteName: string, path: string, behavior: Template['behavior']): string {
	const isDailyNote = behavior === 'append-daily' || behavior === 'prepend-daily';

	if (isDailyNote) {
		const pattern = generalSettings.dailyNotePath || 'Journal/{date:YYYY-MM-DD}';
		const today = new Date();
		const yyyy = today.getFullYear().toString();
		const mm = String(today.getMonth() + 1).padStart(2, '0');
		const dd = String(today.getDate()).padStart(2, '0');
		return pattern
			.replace('{date:YYYY-MM-DD}', `${yyyy}-${mm}-${dd}`)
			.replace('{date:YYYY}', yyyy)
			.replace('{date:MM}', mm)
			.replace('{date:DD}', dd);
	}

	const normalizedPath = path?.endsWith('/') ? path : path ? path + '/' : '';
	return normalizedPath + sanitizeFileName(noteName);
}

async function readPage(serverUrl: string, pagePath: string): Promise<string | null> {
	const url = `${serverUrl}/.fs/${encodeURI(pagePath)}.md`;
	const response = await fetchProxy(url, {
		method: 'GET',
		headers: buildAuthHeader()
	});
	if (response.ok) return response.text;
	if (response.status === 404 || response.error === 'not_found') return null;
	throw new Error(`Failed to read page: HTTP ${response.status}`);
}

async function writePage(serverUrl: string, pagePath: string, content: string): Promise<void> {
	const url = `${serverUrl}/.fs/${encodeURI(pagePath)}.md`;
	const response = await fetchProxy(url, {
		method: 'PUT',
		headers: {
			...buildAuthHeader(),
			'Content-Type': 'text/markdown'
		},
		body: content
	});

	if (!response.ok) {
		if (response.status === 401 || response.status === 403) {
			throw new Error(`AUTH_ERROR:${response.status}`);
		}
		throw new Error(`HTTP ${response.status}: ${response.text || 'Failed to save'}`);
	}
}

export async function saveToSilverBullet(
	fileContent: string,
	noteName: string,
	path: string,
	behavior: Template['behavior'],
): Promise<void> {
	const serverUrl = (generalSettings.serverUrl || '').replace(/\/+$/, '');
	if (!serverUrl) {
		throw new Error('NOSERVER');
	}

	const pagePath = buildPagePath(noteName, path, behavior);

	if (behavior === 'create' || behavior === 'overwrite') {
		await writePage(serverUrl, pagePath, fileContent);
	} else {
		// append-specific, prepend-specific, append-daily, prepend-daily
		const existing = await readPage(serverUrl, pagePath);
		let combined: string;
		if (existing === null) {
			combined = fileContent;
		} else if (behavior.startsWith('append')) {
			combined = existing.trimEnd() + '\n\n' + fileContent;
		} else {
			combined = fileContent + '\n\n' + existing.trimStart();
		}
		await writePage(serverUrl, pagePath, combined);
	}

	if (!generalSettings.silentOpen) {
		const pageUrl = `${serverUrl}/${encodeURI(pagePath)}`;
		browser.tabs.create({ url: pageUrl });
	}
}
