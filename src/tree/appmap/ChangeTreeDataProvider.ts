import * as vscode from 'vscode';
import AppMapDescriptor from '../../appmapDescriptor';
import { notEmpty } from '../../util';
import AppMapCollection from '../../appmapCollection';

async function buildLookupTable(descriptors: AppMapDescriptor[]): Promise<Map<string, AppMapDescriptor>> {
  const lookup = new Map();
  descriptors.forEach((d) => {
    if (!d.metadata?.name || !d.metadata?.fingerprints) {
      return;
    }

    lookup[d.metadata.name as string] = d;
  });
  return lookup;
}

class AppMapDifference {
  public algorithm: string;
  public base: AppMapDescriptor | null;
  public working: AppMapDescriptor | null;

  constructor(algo: string, base: AppMapDescriptor | null, working: AppMapDescriptor | null) {
    this.algorithm = algo;
    this.base = base;
    this.working = working;
  }

  public getChange(): vscode.TreeItem | null {
    if (!this.base && !this.working) {
      return null;
    }

    if (!this.base && this.working) {
      const name = this.working.metadata?.name as string;
      return {
        label: `added: ${name}`,
        tooltip: name,
        command: {
          title: 'open',
          command: 'vscode.open',
          arguments: [this.working.resourceUri],
        },
      };
    }

    if (this.base && !this.working) {
      const name = this.base.metadata?.name as string;
      return {
        label: `removed: ${name}`,
        tooltip: name,
        command: {
          title: 'open',
          command: 'vscode.open',
          arguments: [this.base.resourceUri],
        },
      };
    }

    if (!this.base || !this.working) {
      // We should never get here, but it keeps the TS compiler happy
      return null;
    }

    // const baseDoc = await canonicalizeAppMap(this.algorithm, this.base);
    // const workingDoc = await canonicalizeAppMap(this.algorithm, this.working);
    // const changes = diffLines(baseDoc, workingDoc);

    const name = this.working.metadata?.name as string;
    return {
      label: `changed: ${name}`,
      tooltip: name,
      command: {
        title: 'open',
        command: 'appmap.diff',
        arguments: [this.base.resourceUri, this.working.resourceUri],
      },
    };
  }
}

export class ChangeTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    vscode.TreeItem | undefined | null | void
  > = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
  public readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this
    ._onDidChangeTreeData.event;

  private baseAppMaps: AppMapCollection;
  private workingAppMaps: AppMapCollection;

  constructor(baseAppMaps: AppMapCollection, workingAppMaps: AppMapCollection) {
    this.baseAppMaps = baseAppMaps;
    this.workingAppMaps = workingAppMaps;

    baseAppMaps.onUpdated(() => this._onDidChangeTreeData.fire());
    workingAppMaps.onUpdated(() => this._onDidChangeTreeData.fire());
  }

  public getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  public async findChangeSet(algorithm: string): Promise<vscode.TreeItem[]> {
    const baseDescriptors = this.baseAppMaps.appmapDescriptors();
    const workingDescriptors = this.workingAppMaps.appmapDescriptors();

    const result: vscode.TreeItem[] = [];
    const baseLookup = await buildLookupTable(baseDescriptors);
    const workingLookup = await buildLookupTable(workingDescriptors);
    Object.keys(baseLookup).forEach((baseName) => {
      if (!workingLookup[baseName]) {
        const base = baseLookup[baseName];
        const diff = new AppMapDifference(algorithm, base, null);
        const change = diff.getChange();
        if (change) {
          result.push(change);
        }
      }
    });

    return workingDescriptors
      .map((working) => {
        if (!working.metadata?.name || !working.metadata?.fingerprints) {
          return null;
        }

        const name: string = working.metadata.name as string;
        const base = baseLookup[name];
        if (!base) {
          const diff = new AppMapDifference(algorithm, null, working);
          return diff.getChange();
        }

        const baseFingerprint = base.metadata.fingerprints.find(
          (fingerprint) => fingerprint.canonicalization_algorithm === algorithm
        );

        const fingerprints: Record<string, string>[] = working.metadata.fingerprints as Record<string, string>[];
        const workingFingerprint = fingerprints.find(
          (fingerprint) => fingerprint.canonicalization_algorithm === algorithm
        );

        if (!baseFingerprint || !workingFingerprint) {
          console.warn(`No ${algorithm} fingerprint found on AppMap ${name}`);
          return null;
        }

        if (baseFingerprint.digest !== workingFingerprint.digest) {
          const diff = new AppMapDifference(algorithm, base, working);
          return diff.getChange();
        }

        return null;
      })
      .filter(notEmpty);
  }

  public getChildren(): Thenable<vscode.TreeItem[]> {
    return this.findChangeSet('beta_v1_info');
  }
}
