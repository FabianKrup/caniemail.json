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
            process.chdir('./caniemail');

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

if (!checkIfRepoExists()) {
    console.error('Das Verzeichnis `caniemail` existiert nicht.');
    process.exit(1);
}

try {
    const updateService = new UpdateService();
    const apiData = await updateService.fetchApiData();
    const apiDataPath = './api.json';

    // Attempt to write API data to file
    await fs.promises.writeFile(apiDataPath, JSON.stringify(apiData, null, 2));
    console.log('API data has been written to api.json');

    // Attempt to add api.json to staging
    await exec('git add api.json');
    console.log('api.json has been staged for commit');

    // Commit changes, if any
    try {
        await exec('git commit -m "Updated API data"');
        console.log('API data has been committed');
    } catch (commitError) {
        console.log('No changes to commit or an error occurred:', commitError);
    }

    // Attempt to push changes
    await exec('git push origin data');
    console.log('Changes have been pushed to the data branch');
} catch (error) {
    console.error('An error occurred during the update process:', error);
}
