const w3c_spec = 'https://w3c.github.io/validate-repos/report.json';
const specref_api = 'https://api.specref.org/bibrefs?refs=';
const w3c_tr = 'https://www.w3.org/TR/';
const target_info = 'list_spec.json'; // json data of spec info
var w3c_data; // json data from w3c_spec
var list_spec = []; // list of github fullname like 'immersive-web/webxr'
var hash_spec_info = {}; 
var hash_tgt_info = {};
var hash_specref = {};

// show or not by w3c.json repo-type
var show_repotype = {
  'rec-track': 1,
  'note': 1,
  'cg-report': 1,
  'tests': 0,
  'process': 0,
  'workshop': 0,
  'homepage': 0,
  'translation': 0,
  'article': 0,
  'tool': 0,
  'project': 0,
  'others': 0,
};

// constract list_spec and hash_spec_info
// from w3c spec json, search by group id
function initDataArray(gid) {
  gid.forEach((id) => {
    if (w3c_data['groups'][id]) {
      var dh = w3c_data['groups'][id];
      dh['repos'].forEach((repo) => { list_spec.push(repo.fullName); });
      var elem;
      var pelem = document.getElementById('listgroup');
      var etxt = '';
      // h2 + ul
      elem = document.createElement('h2');
      elem.innerHTML = '<a href="' + dh['_links']['homepage']['href'] + '">' + dh['name'] + '</a> ';
      pelem.appendChild(elem);
      elem = document.createElement('p');
      etxt += dh['type'];
      etxt += ', <a href="' + dh['_links']['join']['href'] + '">Join</a>';
      if (dh['type'] == 'working group') {
        etxt += ', <a href="' + dh['_links']['pp-status']['href'] + '">Status</a>';
        etxt += ', current charter ends by ' + dh['end-date'];
      }
      elem.innerHTML = etxt;
      pelem.appendChild(elem);
      elem = document.createElement('ul');
      elem.id = 'listspec_' + id;
      pelem.appendChild(elem);
    };
  });
  w3c_data['repos'].forEach((repo) => {
    var repo_name = repo['owner']['login'] + '/' + repo['name'];
    if (list_spec.includes(repo_name)) {
      hash_spec_info[repo_name] = repo;
    }
  });
}

// output spec information to html, from constructed data
// 1st add li per spec, 2nd add status info from local json
function refleshListSpec() {
  Object.keys(hash_spec_info).forEach((spec) => {
    if (hash_spec_info[spec]['w3cjson'] && 
        show_repotype[hash_spec_info[spec]['w3c']['repo-type']]) {
      var elem = document.createElement('li');
      elem.id = 'si_' + spec.replace('/', '_');
      var etxt = '';
      etxt += '<a href="https://github.com/' + spec + '">' + hash_spec_info[spec]['name'] + '</a>';
      etxt += ' (' + hash_spec_info[spec]['w3c']['repo-type'] + ')';
      etxt += '<ul id="siul_' + spec.replace('/', '_') + '"></ul>';
      elem.innerHTML = etxt;
      var target = 'listspec_' + hash_spec_info[spec]['w3c']['group'];
      document.getElementById(target).appendChild(elem);
    }
  });
  Object.keys(hash_tgt_info).forEach((spec) => {
    var eid = 'siul_' + spec.replace('/', '_');
    for (var id = 0; id < hash_tgt_info[spec].spec.length; ++id) {
      var clv = hash_tgt_info[spec]['spec'][id]['level'];
      var sname = hash_spec_info[spec]['name'];
      if (hash_tgt_info[spec]['spec'][id]['shortname']) {
        sname = hash_tgt_info[spec]['spec'][id]['shortname'];
      }
      var celemid = "spec_" + sname + "_" + clv;
      var lvelem = document.createElement('li');
      var tr_links = undefined;
      var editors = undefined;
      if (sname in hash_specref) {
        tr_links = 'Links: ';
        tr_links += '<a href="' + w3c_tr + sname +'/">TR/' + sname + '</a>';
        tr_links += '; ' + hash_specref[sname]['status'] + ' ';
        tr_links += '<a href="' + w3c_tr + hash_specref[sname]['date'].slice(-4) + '/';
        if (hash_specref[sname]['status'] == 'CR') { tr_links += 'CRD-'; }
        else { tr_links += hash_specref[sname]['status'] + '-'; }
        tr_links += hash_specref[sname]['versions'][0];
        tr_links += '/">' + hash_specref[sname]['date'] + '</a>';
        editors = 'Editors: ';
        hash_specref[sname]['authors'].forEach((ename) => {
          editors += '"' + ename + '", ';
        });
        editors = editors.slice(0, -2);
      }
      lvelem.innerHTML = "Level " + clv + " <ul id='" + celemid + "'></ul>";
      document.getElementById(eid).appendChild(lvelem);
      if (tr_links) { document.getElementById(celemid).innerHTML += '<li>' + tr_links + '</li>'; }
      if (editors) { document.getElementById(celemid).innerHTML += '<li>' + editors + '</li>'; }
      // for TAG review
      if (hash_tgt_info[spec]['spec'][id]['tag']) {
        var elem_tag = document.createElement('li');
        var text_tag = "TAG reviews: ";
        Object.keys(hash_tgt_info[spec]['spec'][id]['tag']).forEach(key =>
          {text_tag += "[<a href='" + hash_tgt_info[spec]['spec'][id]['tag'][key] + "'>" + key + "</a>]"});
        elem_tag.innerHTML = text_tag;
        document.getElementById(celemid).appendChild(elem_tag);
      }
      // for events
      for (var iev = 0; iev < hash_tgt_info[spec]['spec'][id]['events'].length; ++iev) {
        var cev = hash_tgt_info[spec]['spec'][id]['events'][iev];
        var elem = document.createElement('li');
        var etxt = '';
        etxt += cev['target'].toUpperCase();
        etxt += ': ';
        if (cev['date']) {
          etxt += '<a href="' + generateTRUrl(sname, cev['target'], cev['date']) + '">Published at ' + cev['date'] + '</a> ';
        }
        if (cev['pubreq']) {
          etxt += '(<a href="' + cev['pubreq'] + '">Publication request</a>) ';
        } else if (cev['target'] !== "wg") {
          etxt += '(No publication request yet';
          if (cev['expected']) {
            etxt += "; expected around: " + cev['expected'];
          }
          etxt += ') ';
        }
        if (cev['cfc'] || cev['resolution']) {
          etxt += 'Group decision by ';
          if (cev['cfc']) { etxt += '[<a href="' + cev['cfc'] + '">CfC</a>] '; }
          if (cev['resolution']) { etxt += '[<a href="' + cev['resolution'] + '">Resolution</a>] '; }
        }
        etxt += '<ul id="' + eid + '_' + clv + '_' + cev['target'] + '">';
        if ('pre' in cev) {etxt += '<li>Pre-publish: ' + makeInfoLine(cev['pre']) + '</li>'; }
        if ('post' in cev) {etxt += '<li>Post-publish: ' + makeInfoLine(cev['post']) + '</li>'; }
        etxt += '</ul>'
        elem.innerHTML = etxt;
        document.getElementById(celemid).appendChild(elem);
      }
    }
  });
}

// add review lines
function makeInfoLine(hash) {
  var ret = '';
  if ('summary' in hash) {
    ret += '<a href="' + hash['summary'] + '">Summary at github issue</a>';
  }
  var review = '';
  ['tag', 'a11y', 'i18n', 'privacy', 'security'].forEach((id) => {
    if (id in hash) { review += ' [<a href="' + hash[id] + '">' + id + '</a>] '; }
  });
  if (review != '') {
    ret += 'Reviews (' + review + ')';
  }
  return ret;
}

function generateTRUrl(shortname, stage, date) {
  date = date.replaceAll('/', '');
  var year = date.substring(0, 4);
  stage = stage.toUpperCase();
  if (stage == 'FPWD') { stage = 'WD'; }
  return 'https://www.w3.org/TR/' + year + '/' + stage + '-' + shortname + '-' + date + '/';
}

window.addEventListener('load', function(event) {
  var pm_es = fetch(w3c_spec, {
    cache: 'no-cache', method: 'GET', redirect: 'follow'})
  .then((response) => {
    if (response.ok) {return response.json(); }
    throw Error('Returned response for data (' + w3c_spec + '): ' + response.status);
  }).then((json) => {
    w3c_data = json;
    initDataArray(list_groups);
  }).catch((error) => { console.log('Error found: ' + error.message); });
  var pm_ti = fetch(target_info, {
    cache: 'no-cache', method: 'GET', redirect: 'follow'})
  .then((response) => {
    if (response.ok) {return response.json(); }
    throw Error('Returned response for data (' + target_info + '): ' + response.status);
  }).then((json) => {
    hash_tgt_info = json;
  }).catch((error) => { console.log('Error found: ' + error.message); });
  Promise.all([ pm_es, pm_ti ])
  .then(() => {
    let shorts = '';
    Object.keys(hash_tgt_info).forEach((spec) => {
      hash_tgt_info[spec]['spec'].forEach((short) => {
        shorts += short['shortname'] + ',';
      });
    });
    return fetch(specref_api + shorts.slice(0, -1), {
      cache: 'no-cache', method: 'GET', redirect: 'follow'});
  }).then((response) => {
    if (response.ok) {return response.json(); }
    return {};
  }).then((json) => {
    hash_specref = json;
    refleshListSpec();
  });
});

