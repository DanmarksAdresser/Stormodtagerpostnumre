// Inspireret af https://www.freecodecamp.org/news/the-ultimate-guide-to-web-scraping-with-node-js-daa2027dcd3/
//
const url = require('url');
const rp = require('request-promise');
const $ = require('cheerio');
const puppeteer= require('puppeteer');
const findpostnummerurl = 'http://www2.postdanmark.dk/findpostnummer/Findpostnummer.do';

async function main() {

	let firmapostnumre = ['0800', '0999', '1092', '1093', '1095', '1098', '1140', '1147', '1148', '1217', '1448', '1566', '1592', '1599', '1630', '1780', '1785', '1786', '1787']
	//debugger; input [name=]	
	require('events').EventEmitter.defaultMaxListeners = 75;
  for (let i= 0; i<firmapostnumre.length; i++) {
  	await danfirmapostnummeradresser(firmapostnumre[i]);
	};


}

async function danfirmapostnummeradresser(postnr) {
  	try {
			const browser = await puppeteer.launch();
		  //console.log(browser);
		  let page = await browser.newPage();
		  //console.log(page);
		  await page.goto(findpostnummerurl);
		  await page.click('input[name="zipcode"]');
		  await page.keyboard.type(postnr);
		  await page.click('input[value="Søg"]');
		  let html= await page.content();
		  //console.log(html);

			let husnummerintevaller= $('#pdkTable > tbody > tr', html);
  		console.log(postnr);
			console.log(husnummerintevaller.length);
			//console.log(husnummerintevaller);
			let linje= /^([A-ZÆØÅa-zæøå ]+) ([0-9][A-ZÆØÅ0-9\-, ]*)/;
			husnummerintevaller.each(function(i, elem) {
				//console.log(elem);
				let kolonner= $('td', elem);
				// console.log(kolonner);
				// console.log(kolonner[2].children[0]);
				let gadeoghusnumre= kolonner[2].children[0].data.trim();
				let firma= kolonner[4].children[0].data.trim();
				let postdistrikt= kolonner[1].children[0].data.trim();
				// console.log(firma + ', ' + gadeoghusnumre + ', ' + postdistrikt + ', ' + postnr);
				let result= linje.exec(gadeoghusnumre);
				if (result) {
					let vejnavn= result[1].trim();
					let husnumretekst= result[2].trim();
					console.log('vejnavn: ' + vejnavn + ', husnumre: ' + husnumretekst);
					let husnumre= husnumretekst.split(',');
					for (let i= 0;i<husnumre.length; i++) {
						husnumre[i]= husnumre[i].trim();
						let interval= husnumre[i].split('-');
						if (interval.length > 1) {
							husnumre[i]= interval[0];
							for (let nr= parseInt(interval[0])+1; nr<=parseInt(interval[1]); nr++) {
								husnumre.push(interval[1]);
							}
						}
						let adresse= vejnavn + ' ' + husnumre[i] + ', ' + postdistrikt + ' (' + firma + ')';
						console.log(adresse);
					}
				}
				else {			
					console.log(gadeoghusnumre);
				}

			});

			await browser.close();

	  }
	  catch(e) {
	  	console.log('problemer med posrnummer: ' + postnr + ' - ' + e)
	  }
	}

// async function main() {

// 	let firmapostnumre = ['0800', '0999', '1092', '1093', '1095', '1098', '1140', '1147', '1148', '1217', '1218', '1448', '1566', '1592', '1599', '1630', '1780', '1785', '1786', '1787']
// 	//debugger; input [name=]	
// 	require('events').EventEmitter.defaultMaxListeners = 25;
//   firmapostnumre.forEach(async function(postnr) {
// 		const browser = await puppeteer.launch();
// 	  //console.log(browser);
// 	  let page = await browser.newPage();
// 	  //console.log(page);
// 	  await page.goto(findpostnummerurl);
// 	  await page.click('input[name="zipcode"]');
// 	  await page.keyboard.type(postnr);
// 	  await page.click('input[value="Søg"]');
// 	  //await page.waitForNavigation();
// 	  let html= await page.content();
// 	  //console.log(html);

// 		let firmaer= $('#pdkTable > tbody > tr > td:nth-child(5)', html);
// 		for (let i = 0; i<firmaer.length; i++) {
// 			firmaer[i]= firmaer[i].children[0].data.trim();
// 			console.log(firmaer[i]);
// 		};

// 		let postdistrikter= $('#pdkTable > tbody > tr > td:nth-child(2)', html);
// 		for (let i = 0; i<postdistrikter.length; i++) {
// 			postdistrikter[i]= postdistrikter[i].children[0].data.trim();
// 			console.log(postdistrikter[i]);
// 		};

// 		let husnummerintevaller= $('#pdkTable > tbody > tr > td:nth-child(3)', html);
// 		console.log(husnummerintevaller.length);
// 		let linje= /^([A-ZÆØÅa-zæøå ]+) ([0-9][A-ZÆØÅ0-9\-, ]*)/;
// 		for (let i = 0; i<husnummerintevaller.length; i++) {
// 			let tekst= husnummerintevaller[i].children[0].data.trim();
// 			let result= linje.exec(tekst);
// 			if (result) {
// 				let vejnavn= result[1].trim();
// 				let husnumre= result[2].trim();
// 				console.log('vejnavn: ' + vejnavn + ', husnumre: ' + husnumre);
// 			}
// 			else {			
// 				console.log(tekst);
// 			}

// 		};

//   	await browser.close();

// 	});

// }

// async function main() {
// 	//debugger;
// 	let html= await rp(kodelisterurl);
// 	//console.log(html);
// 	let kodelister= $('td > input > option', html);
// 	//console.log('Antal kodelister: ' + kodelister.length);
// 	//console.log(kodelister);
// 	for (let i= 1; i<kodelister.length; i++) {
// 		let kurl= url.parse(kodelister[i].attribs.value);
// 		let names= kurl.pathname.split('/');
// 		//console.log(names[names.length-1]);
// 		startkode(names[names.length-1]);
// 		let khtml= await rp(kodelister[i].attribs.value);		
// 		let kodeliste= $('ul.kodeliste-list > li', khtml);
// 		//console.log(kodeliste.length);
// 		//let kodeognavn= /^([\d\w]+)\s-\s([\S+])$/;
// 		let kodeognavn= /^([\d\w]+)\s-\s([\s\w\(\)æøåÆØÅé,.<>\-\/&§”:+…­­­­­­­½\[\]\–]+)$/;
// 		for (let j= 0; j<kodeliste.length; j++) {
// 			let result= kodeognavn.exec(kodeliste[j].children[0].data);
// 			if (result) {
// 				casekode(result[1], result[2]);
// 				// console.log(result[1], + ': ' + result[2]);
// 			}
// 			else {				
// 				console.log(kodeliste[j].children[0].data);
// 			}
// 		}
// 		slutkode();
// 	}

// }

function startkode(kodelistenavn) {
	console.log('');
	console.log('export function get' + kodelistenavn + '(kode) {');
	console.log('\tswitch (kode) { ');
}

function casekode(kode, navn) {
	let tal= /^\d+$/;
	if (tal.exec(kode)) {		
		console.log('\tcase ' + parseInt(kode, 10) + ':');
	}	
	else {		
		console.log('\tcase "' + kode + '":');
	}
	console.log('\t\tnavn= "' + navn.replace(/\r\n|\n|\r/g, " ").replace(/[ ]+/g, ' ') + '";');	
	//console.log('\t\tnavn= "' + navn.split(/\r\n|\n|\r/).join("").replace(/[ ]+/g, ' ') + '";');	
	console.log('\t\tbreak;');	
}

function slutkode() {	
	console.log('\tdefault:');	
	console.log('\t\tnavn= "Ukendt kode";');	
	console.log('\t}');			
	console.log('\treturn navn;');		
	console.log('}');	
}

main();