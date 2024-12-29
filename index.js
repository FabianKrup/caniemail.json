import simpleGit from 'simple-git';
import fs from 'fs';
import { exec } from '@actions/exec';
import { UpdateService } from './update.service.js';

const git = simpleGit();

const checkIfRepoExists = async () => {
    try {
        const dirPath = './caniemail';

        if (fs.existsSync(dirPath)) {
            // Change the current directory to "caniemail"
            process.chdir(dirPath);

            // Check if the current directory is a Git repository
            const isRepo = await git.checkIsRepo();
            if (isRepo) {
                return true;
            } else {
                console.error(
                    'Das Verzeichnis `caniemail` ist kein Git-Repository.',
                );
                return false;
            }
        } else {
            console.error('Das Verzeichnis `caniemail` existiert nicht.');
            return false;
        }
    } catch (error) {
        console.error('Ein Fehler ist aufgetreten:', error);
        return false;
    }
};

if (!(await checkIfRepoExists())) {
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
