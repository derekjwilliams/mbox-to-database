const { simpleParser } = require('mailparser');
const fs = require('fs');
const cheerio = require('cheerio');

function extractLinksFromHtml(htmlString, baseUrl = 'https://example.com') {
  const $ = cheerio.load(htmlString);
  const links = $('a[href^="' + baseUrl + '"]'); // Select all <a> tags with href starting with baseUrl
  const filteredLinks = [];

  links.each((index, element) => {
    const href = $(element).attr('href');
    if (href) {
      filteredLinks.push(href);
    }
  });

  return filteredLinks;
}


function dumpHtmlAndText({html = '<html></html>', text = ''} = {}) {
  if (html !== '<html></html>') {
    const $ = cheerio.load(html);
    const innerHTML = $('#content').html();
    console.log(innerHTML)
  }
  if (text !== '') {
    console.log(text)
  }
}

function transform({html = '<html></html>', text = ''} = {}) {
  if (html) {
    const links = extractLinksFromHtml(html, 'https://links-2.govdelivery.com')
    if (links.length > 0) {
      console.log(links)
    }
  }
}

async function parse(filename) {
  const mboxFileString = await fs.promises.readFile(filename, 'utf8');
  const messages = mboxFileString.split(/\nFrom /);
  const result = []
  for (let i = 0; i < messages.length; i++) {
    simpleParser(messages[i])
      .then((mail) => {
        result.push(mail)
        const from = mail.from ? (mail.from.value || mail.from.text) : 'Unknown';
        const to = mail.to ? (mail.to.value || mail.to.text) : 'Unknown';
        const subject = mail.subject || 'No Subject';
        const html = mail.html ? mail.html : ''
        const text = mail.text ? mail.text : ''
        dumpHtmlAndText({html: html, text: text})
        //console.log('headers:', mail.headers);
      })
      .catch((err) => {
        console.error('Error parsing email:', err);
      });
  }
  return result
}

parse('./public.govdelivery.com.mbox')