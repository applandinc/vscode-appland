import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { DatabaseUpdater } from './databaseUpdater';
import { ScenarioProvider } from './scenarioViewer';
import Telemetry from './telemetry';
import registerTrees from './tree';
import AppMapCollectionFile from './appmapCollectionFile';
import RemoteRecording from './remoteRecording';
import { notEmpty } from './util';

async function getBaseUrl(): Promise<string | undefined> {
  return await vscode.window.showInputBox({
    placeHolder: 'URL of remote recording server, eg "http://localhost:3000"',
  });
}

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const localAppMaps = new AppMapCollectionFile();

  Telemetry.register(context);
  ScenarioProvider.register(context);
  DatabaseUpdater.register(context);

  localAppMaps.initialize();
  const { localTree } = registerTrees(localAppMaps);

  context.subscriptions.push(
    vscode.commands.registerCommand('appmap.applyFilter', async () => {
      const filter = await vscode.window.showInputBox({
        placeHolder:
          'Enter a case sensitive partial match or leave this input empty to clear an existing filter',
      });

      localAppMaps.setFilter(filter || '');
      localTree.reveal(localAppMaps.appmapDescriptors[0], { select: false });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('appmap.findByName', async () => {
      const items = localAppMaps
        .allDescriptors()
        .map((d) => d.metadata?.name as string)
        .filter(notEmpty)
        .sort();

      const name = await vscode.window.showQuickPick(items, {});
      if (!name) {
        return;
      }

      const descriptor = localAppMaps.findByName(name);
      if (!descriptor) {
        return;
      }

      vscode.commands.executeCommand('vscode.open', descriptor.resourceUri);
    })
  );

  Telemetry.reportStartUp();

  context.subscriptions.push(
    vscode.commands.registerCommand('appmap.startRemoteRecording', async () => {
      const baseURL = (await getBaseUrl()) || '';

      if (baseURL === '') {
        return;
      }

      try {
        RemoteRecording.start(baseURL);
        vscode.window.showInformationMessage(`Recording started at "${baseURL}"`);
      } catch (e) {
        vscode.window.showErrorMessage(`Start recording failed: ${e.name}: ${e.message}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('appmap.getRemoteRecordingStatus', async () => {
      const baseURL = (await getBaseUrl()) || '';

      if (baseURL === '') {
        return;
      }

      try {
        const recordingStatus = (await RemoteRecording.getStatus(baseURL)) ? 'enabled' : 'disabled';
        vscode.window.showInformationMessage(
          `Recording status at "${baseURL}": ${recordingStatus}`
        );
      } catch (e) {
        vscode.window.showErrorMessage(`Recording status failed: ${e.name}: ${e.message}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('appmap.stopRemoteRecording', async () => {
      const baseURL = (await getBaseUrl()) || '';

      if (baseURL === '') {
        return;
      }

      const appmapName = await vscode.window.showInputBox({
        placeHolder: 'AppMap name',
      });

      if (!appmapName) {
        return;
      }

      try {
        const appmap = await RemoteRecording.stop(baseURL);
        appmap['metadata']['name'] = appmapName;

        let folder: string;
        if (!vscode.workspace.workspaceFolders) {
          folder = vscode.workspace.rootPath as string;
        } else {
          folder = vscode.workspace.workspaceFolders[0].uri.fsPath;
        }

        const filePath = path.join(folder, `recording_${+new Date()}.appmap.json`);
        fs.writeFileSync(filePath, JSON.stringify(appmap), 'utf8');

        vscode.workspace.openTextDocument(filePath).then((doc) => {
          vscode.window.showTextDocument(doc);
        });

        vscode.window.showInformationMessage(`Recording stopped at "${baseURL}"`);
      } catch (e) {
        vscode.window.showErrorMessage(`Stop recording failed: ${e.name}: ${e.message}`);
      }
    })
  );
}
