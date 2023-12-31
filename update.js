import cardsJSON from './src/lib/cards.json' assert { type: 'json' };
import webp from 'webp-converter';
import fs from 'fs';

const api_url = 'https://sg-hk4e-api-static.hoyoverse.com/event/e20221207cardlanding/v2/card_config?lang=en-us';
const path_dir_cards = './static/cards';
const path_dir_png = './temp_png';

let count = 0;

const requests = [
	{
		type: 'characters',
		data: 'role_card_infos',
		options: {
			method: 'POST',
			headers: {
				authority: 'sg-hk4e-api-static.hoyoverse.com',
				accept: 'application/json, text/plain, */*',
				'accept-language': 'en,de;q=0.9',
				'content-type': 'application/json',
				origin: 'https://act.hoyoverse.com',
				referer: 'https://act.hoyoverse.com/',
				'sec-ch-ua': 'Google Chrome";v="111", "Not(A:Brand";v="8", "Chromium";v="111',
				'sec-ch-ua-mobile': '?0',
				'sec-ch-ua-platform': 'Windows',
				'sec-fetch-dest': 'empty',
				'sec-fetch-mode': 'cors',
				'sec-fetch-site': 'same-site',
				'sec-gpc': '1',
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
			},
			body: '{"page":1,"page_size":1000,"card_type":0,"role_search":{"element_type":"","weapon":"","belong":""},"action_search":{"action_card_type":"","cost_num":"","is_other_cost":false}}'
		}
	},
	{
		type: 'actions',
		data: 'action_card_infos',
		options: {
			method: 'POST',
			headers: {
				authority: 'sg-hk4e-api-static.hoyoverse.com',
				accept: 'application/json, text/plain, */*',
				'accept-language': 'en,de;q=0.9',
				'content-type': 'application/json',
				origin: 'https://act.hoyoverse.com',
				referer: 'https://act.hoyoverse.com/',
				'sec-ch-ua': 'Google Chrome";v="111", "Not(A:Brand";v="8", "Chromium";v="111',
				'sec-ch-ua-mobile': '?0',
				'sec-ch-ua-platform': 'Windows',
				'sec-fetch-dest': 'empty',
				'sec-fetch-mode': 'cors',
				'sec-fetch-site': 'same-site',
				'sec-gpc': '1',
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
			},
			body: '{"page":1,"page_size":1000,"card_type":1,"role_search":{"element_type":"","weapon":"","belong":""},"action_search":{"action_card_type":"","cost_num":"","is_other_cost":false}}'
		}
	}
];

async function run() {
	await prepare();
	console.log('completed: prepare');
	await update();
	console.log('completed: update');
	await download();
	console.log('completed: download');
	await convert();
	console.log('completed: convert');
	await clean();
	console.log('completed: clean');
	console.log(`added ${count} new cards`);
}

async function prepare() {
	fs.mkdirSync(path_dir_png, { recursive: true });
}

async function update() {
	let cards = {
		characters: [],
		actions: []
	};

	try {
		for (const req of requests) {
			const response = await fetch(api_url, req.options);
			const json = await response.json();
			cards[req.type] = json.data[req.data];
		}
	} catch (error) {
		console.error(error);
	}

	cardsJSON.latest = (parseInt(cardsJSON.latest) + 1).toString();
	cardsJSON[cardsJSON.latest] = cards;

	fs.writeFileSync('./src/lib/cards.json', JSON.stringify(cardsJSON, null, 2));
}

async function download() {
	const files = fs.readdirSync(path_dir_cards);
	const cards = cardsJSON[cardsJSON.latest];

	for (const type of requests.map((x) => x.type)) {
		for (const card of cards[type]) {
			if (files.includes(`${card.id}.webp`)) continue;
			count++;
			const response = await fetch(card.resource);
			const blob = await response.blob();
			const arrayBuffer = await blob.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			await fs.writeFileSync(`${path_dir_png}/${card.id}.png`, buffer);
		}
	}
}

async function convert() {
	const pngs = fs.readdirSync(path_dir_png);
	for (const png of pngs) {
		await webp.cwebp(`${path_dir_png}/${png}`, `${path_dir_cards}/${png.split('.')[0]}.webp`, '-q 80');
	}
}

async function clean() {
	fs.rmSync(path_dir_png, { recursive: true });
}

run();
