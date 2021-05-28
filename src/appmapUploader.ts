import * as vscode from 'vscode';
import * as bent from 'bent';
import Telemetry from './telemetry';

export class AppmapUploader {
  static uploadConfirmed = false;

  public static async upload(appMapFile: vscode.TextDocument): Promise<void> {
    const uri = this.getUri();

    if (!uri.authority) {
      vscode.window.showErrorMessage(`URL of AppLand Server is empty`);
      return;
    }

    try {
      const post = bent(uri.toString(), 'POST', 'json', 201, {
        'X-Requested-With': 'VSCodeUploader',
      });

      if (!this.uploadConfirmed) {
        const confirmation = await vscode.window.showInformationMessage(
          'You are about to upload this AppMap to the AppMap cloud. Would you like to continue?',
          ...['Yes', 'No']
        );
        if (confirmation === 'Yes') {
          this.uploadConfirmed = true;
        } else {
          return;
        }
      }

      const response = (await post('api/appmaps/create_upload', {
        data: appMapFile.getText(),
      })) as {
        id: number;
        token: string;
      };

      const confirmUri = this.getConfirmUri(response.id, response.token);

      vscode.env.openExternal(confirmUri);

      vscode.window.showInformationMessage(`Uploaded ${appMapFile.fileName}`);
      Telemetry.reportAction('upload', {});
    } catch (e) {
      vscode.window.showErrorMessage(`Upload failed: ${e.name}: ${e.message}`);
    }
  }

  private static getUri(): vscode.Uri {
    const configUrl: string = vscode.workspace
      .getConfiguration('appMap')
      .get('serverURL') as string;
    return vscode.Uri.parse(configUrl);
  }

  private static getConfirmUri(id: number, token: string): vscode.Uri {
    return vscode.Uri.joinPath(this.getUri(), '/scenario_uploads', id.toString()).with({
      query: `token=${token}`,
    });
  }
}
