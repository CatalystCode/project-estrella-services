var nconf  =  require('nconf');
nconf.env().argv().defaults({ config: 'localConfig.json' });
const configFile = nconf.get('config');

module.exports = {
    config : nconf.file({ file: configFile, search: true })
}
