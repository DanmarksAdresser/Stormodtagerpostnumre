// Inspireret af https://www.freecodecamp.org/news/the-ultimate-guide-to-web-scraping-with-node-js-daa2027dcd3/
//
const url = require('url');
const rp = require('request-promise');
const $ = require('cheerio');
const kodelisterurl = 'https://www2.postdanmark.dk/findpostnummer/Findpostnummer.do';

async function main() {
	//debugger;
	let html= await rp(kodelisterurl);
	//console.log(html);
	let kodelister= $('div > select > option', html);
	//console.log('Antal kodelister: ' + kodelister.length);
	//console.log(kodelister);
	for (let i= 1; i<kodelister.length; i++) {
		let kurl= url.parse(kodelister[i].attribs.value);
		let names= kurl.pathname.split('/');
		//console.log(names[names.length-1]);
		startkode(names[names.length-1]);
		let khtml= await rp(kodelister[i].attribs.value);		
		let kodeliste= $('ul.kodeliste-list > li', khtml);
		//console.log(kodeliste.length);
		//let kodeognavn= /^([\d\w]+)\s-\s([\S+])$/;
		let kodeognavn= /^([\d\w]+)\s-\s([\s\w\(\)æøåÆØÅé,.<>\-\/&§”:+…­­­­­­­½\[\]\–]+)$/;
		for (let j= 0; j<kodeliste.length; j++) {
			let result= kodeognavn.exec(kodeliste[j].children[0].data);
			if (result) {
				casekode(result[1], result[2]);
				// console.log(result[1], + ': ' + result[2]);
			}
			else {				
				console.log(kodeliste[j].children[0].data);
			}
		}
		slutkode();
	}

}

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