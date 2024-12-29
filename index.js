import fs from 'fs';
import { exec } from '@actions/exec';
import { UpdateService } from './update.service.js';

if (!fs.existsSync('./caniemail/.git')) {
    console.error('Das Verzeichnis `caniemail` existiert nicht.');
    process.exit(1);
}

const updateService = new UpdateService();
const apiData = await updateService.fetchApiData();
const apiDataPath = './api.json';

// Add git config
await exec(
    'git config user.email "${{ github.actor }}@users.noreply.github.com"',
);
await exec('git config user.name "${{ github.actor }}"');

// Checkout data branch
await exec('git checkout -b data');
await exec('git pull --rebase --strategy-option=ours origin data', [], {
    ignoreReturnCode: true,
});

await fs.promises.writeFile(apiDataPath, JSON.stringify(apiData, null, 2));
console.log('API data has been written to api.json');

await exec('git add api.json');
console.log('api.json has been staged for commit');

await exec('git commit -m "Updated API data"');
console.log('API data has been committed');

await exec('git push -u origin data');
console.log('Changes have been pushed to the data branch');
