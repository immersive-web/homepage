const w3c_spec = 'https://w3c.github.io/validate-repos/report.json';
const target_info = 'list_spec.json'; // json data of spec info
var w3c_data; // json data from w3c_spec
var list_spec = []; // list of github fullname like 'immersive-web/webxr'
var hash_spec_info = {}; 
var hash_tgt_info = {};

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
      etxt += ', <a href="' + dh['_links']['pp-status']['href'] + '">Status</a>';
      if (dh['type'] == 'working group') {
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
    for (var id = 0; id < hash_tgt_info[spec].length; ++id) {
      var clv = hash_tgt_info[spec][id]['level'];
      for (var iev = 0; iev < hash_tgt_info[spec][id]['events'].length; ++iev) {
        var cev = hash_tgt_info[spec][id]['events'][iev];
        var elem = document.createElement('li');
        var etxt = '';
        etxt += 'Level ' + clv + ' ' + cev['target'].toUpperCase();
        etxt += ': ';
        if (cev['date']) {
          etxt += '<a href="' + generateTRUrl(hash_spec_info[spec]['name'], cev['target'], cev['date']) + '">Published at ' + cev['date'] + '</a> ';
        }
        if (cev['transition']) {
          etxt += '(<a href="' + cev['transition'] + '">Transition request</a>) ';
        } else {
          etxt += '(No transition request yet) ';
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
        document.getElementById(eid).appendChild(elem);
      }
    }
  });
}

function makeInfoLine(hash) {
  var ret = '';
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
    refleshListSpec();
  });
});

