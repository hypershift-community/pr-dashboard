'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import type { ColumnConfig, Label, PullRequest } from '../types';
import { PRTable } from './PRTable';

interface GroupedPRDisplayProps {
  pullRequests: PullRequest[];
  columns: ColumnConfig[];
  isLoading?: boolean;
  groupByLabels: string[];
  groupByAuthors: string[];
  availableLabels: Label[];
  availableAuthors: { login: string; avatarUrl: string }[];
}

interface PRGroup {
  key: string;
  label: string;
  labelColor?: string;
  avatarUrl?: string;
  pullRequests: PullRequest[];
  subGroups?: PRGroup[];
}

// Check if a PR matches a label (with prefix support)
function prMatchesLabel(pr: PullRequest, labelName: string, availableLabels: Label[]): boolean {
  const isPrefix =
    !labelName.includes(':') && availableLabels.some((l) => l.name.startsWith(`${labelName}:`));

  return pr.labels.some((l) => {
    if (isPrefix) {
      return l.name.startsWith(`${labelName}:`);
    }
    return l.name === labelName;
  });
}

// Group PRs by labels
function groupByLabelsFn(
  prs: PullRequest[],
  labels: string[],
  availableLabels: Label[]
): { groups: PRGroup[]; ungrouped: PullRequest[] } {
  const groups: PRGroup[] = labels.map((labelName) => {
    const label = availableLabels.find((l) => l.name === labelName);
    const matchingPRs = prs.filter((pr) => prMatchesLabel(pr, labelName, availableLabels));

    return {
      key: `label-${labelName}`,
      label: labelName,
      labelColor: label?.color || '6b7280',
      pullRequests: matchingPRs,
    };
  });

  const ungrouped = prs.filter(
    (pr) => !labels.some((labelName) => prMatchesLabel(pr, labelName, availableLabels))
  );

  return { groups, ungrouped };
}

// Collapsible group header component
function GroupHeader({
  group,
  isExpanded,
  onToggle,
  isAuthor = false,
  depth = 0,
}: {
  group: PRGroup;
  isExpanded: boolean;
  onToggle: () => void;
  isAuthor?: boolean;
  depth?: number;
}) {
  const paddingLeft = depth * 16;

  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      style={{ paddingLeft: 16 + paddingLeft }}
    >
      <div className="flex items-center gap-3">
        <svg
          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {isAuthor && group.avatarUrl && (
          <Image
            src={group.avatarUrl}
            alt={group.label}
            width={20}
            height={20}
            className="rounded-full"
          />
        )}
        {!isAuthor && group.labelColor ? (
          <span
            className="px-3 py-1 text-sm font-semibold rounded-full"
            style={{
              backgroundColor: `#${group.labelColor}20`,
              color: `#${group.labelColor}`,
            }}
          >
            {group.label}
          </span>
        ) : (
          <span className="text-sm font-semibold text-gray-700">{group.label}</span>
        )}
        <span className="text-sm text-gray-600">
          {group.pullRequests.length} PR{group.pullRequests.length !== 1 ? 's' : ''}
        </span>
      </div>
    </button>
  );
}

export function GroupedPRDisplay({
  pullRequests,
  columns,
  isLoading,
  groupByLabels,
  groupByAuthors,
  availableLabels,
  availableAuthors,
}: GroupedPRDisplayProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const author of groupByAuthors) initial.add(`author-${author}`);
    for (const label of groupByLabels) initial.add(`label-${label}`);
    return initial;
  });

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Build grouped structure
  const { authorGroups, ungroupedByAuthor } = useMemo(() => {
    if (groupByAuthors.length === 0) {
      return { authorGroups: [], ungroupedByAuthor: pullRequests };
    }

    const groups: PRGroup[] = groupByAuthors.map((authorLogin) => {
      const author = availableAuthors.find((a) => a.login === authorLogin);
      const authorPRs = pullRequests.filter((pr) => pr.author.login === authorLogin);

      // If we also have label grouping, create sub-groups
      let subGroups: PRGroup[] | undefined;
      if (groupByLabels.length > 0) {
        const { groups: labelGroups, ungrouped } = groupByLabelsFn(
          authorPRs,
          groupByLabels,
          availableLabels
        );
        subGroups = labelGroups;
        if (ungrouped.length > 0) {
          subGroups.push({
            key: `author-${authorLogin}-other`,
            label: 'Other',
            pullRequests: ungrouped,
          });
        }
      }

      return {
        key: `author-${authorLogin}`,
        label: authorLogin,
        avatarUrl: author?.avatarUrl,
        pullRequests: authorPRs,
        subGroups,
      };
    });

    const ungrouped = pullRequests.filter((pr) => !groupByAuthors.includes(pr.author.login));

    return { authorGroups: groups, ungroupedByAuthor: ungrouped };
  }, [pullRequests, groupByAuthors, groupByLabels, availableLabels, availableAuthors]);

  // If no author grouping, just do label grouping
  const labelOnlyGroups = useMemo(() => {
    if (groupByAuthors.length > 0 || groupByLabels.length === 0) {
      return { groups: [], ungrouped: [] };
    }
    return groupByLabelsFn(pullRequests, groupByLabels, availableLabels);
  }, [pullRequests, groupByAuthors, groupByLabels, availableLabels]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading pull requests...</div>
      </div>
    );
  }

  // Render label-only grouping (no author grouping)
  if (groupByAuthors.length === 0 && groupByLabels.length > 0) {
    return (
      <div className="space-y-4">
        {labelOnlyGroups.groups
          .filter((group) => group.pullRequests.length > 0)
          .map((group) => (
            <div key={group.key} className="bg-white rounded-lg shadow overflow-hidden">
              <GroupHeader
                group={group}
                isExpanded={expandedGroups.has(group.key)}
                onToggle={() => toggleGroup(group.key)}
              />
              {expandedGroups.has(group.key) && (
                <div className="border-t border-gray-200">
                  <PRTable pullRequests={group.pullRequests} columns={columns} isLoading={false} />
                </div>
              )}
            </div>
          ))}

        {labelOnlyGroups.ungrouped.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <GroupHeader
              group={{
                key: '__other__',
                label: 'Other',
                pullRequests: labelOnlyGroups.ungrouped,
              }}
              isExpanded={expandedGroups.has('__other__')}
              onToggle={() => toggleGroup('__other__')}
            />
            {expandedGroups.has('__other__') && (
              <div className="border-t border-gray-200">
                <PRTable
                  pullRequests={labelOnlyGroups.ungrouped}
                  columns={columns}
                  isLoading={false}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Render author grouping (with optional nested label grouping)
  return (
    <div className="space-y-4">
      {authorGroups
        .filter((authorGroup) => authorGroup.pullRequests.length > 0)
        .map((authorGroup) => (
          <div key={authorGroup.key} className="bg-white rounded-lg shadow overflow-hidden">
            <GroupHeader
              group={authorGroup}
              isExpanded={expandedGroups.has(authorGroup.key)}
              onToggle={() => toggleGroup(authorGroup.key)}
              isAuthor
            />
            {expandedGroups.has(authorGroup.key) && (
              <div className="border-t border-gray-200">
                {authorGroup.subGroups ? (
                  // Nested label groups
                  <div className="bg-gray-50">
                    {authorGroup.subGroups
                      .filter((labelGroup) => labelGroup.pullRequests.length > 0)
                      .map((labelGroup) => (
                        <div
                          key={labelGroup.key}
                          className="border-b border-gray-200 last:border-b-0"
                        >
                          <GroupHeader
                            group={labelGroup}
                            isExpanded={expandedGroups.has(labelGroup.key)}
                            onToggle={() => toggleGroup(labelGroup.key)}
                            depth={1}
                          />
                          {expandedGroups.has(labelGroup.key) && (
                            <div className="border-t border-gray-200">
                              <PRTable
                                pullRequests={labelGroup.pullRequests}
                                columns={columns}
                                isLoading={false}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <PRTable
                    pullRequests={authorGroup.pullRequests}
                    columns={columns}
                    isLoading={false}
                  />
                )}
              </div>
            )}
          </div>
        ))}

      {ungroupedByAuthor.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <GroupHeader
            group={{
              key: '__other_authors__',
              label: 'Other Authors',
              pullRequests: ungroupedByAuthor,
            }}
            isExpanded={expandedGroups.has('__other_authors__')}
            onToggle={() => toggleGroup('__other_authors__')}
          />
          {expandedGroups.has('__other_authors__') && (
            <div className="border-t border-gray-200">
              {groupByLabels.length > 0 ? (
                // Nested label groups for "Other Authors"
                (() => {
                  const { groups, ungrouped } = groupByLabelsFn(
                    ungroupedByAuthor,
                    groupByLabels,
                    availableLabels
                  );
                  return (
                    <div className="bg-gray-50">
                      {groups
                        .filter((labelGroup) => labelGroup.pullRequests.length > 0)
                        .map((labelGroup) => (
                          <div
                            key={labelGroup.key}
                            className="border-b border-gray-200 last:border-b-0"
                          >
                            <GroupHeader
                              group={labelGroup}
                              isExpanded={expandedGroups.has(`other-${labelGroup.key}`)}
                              onToggle={() => toggleGroup(`other-${labelGroup.key}`)}
                              depth={1}
                            />
                            {expandedGroups.has(`other-${labelGroup.key}`) && (
                              <div className="border-t border-gray-200">
                                <PRTable
                                  pullRequests={labelGroup.pullRequests}
                                  columns={columns}
                                  isLoading={false}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      {ungrouped.length > 0 && (
                        <div className="border-b border-gray-200 last:border-b-0">
                          <GroupHeader
                            group={{
                              key: '__other_authors_other__',
                              label: 'Other',
                              pullRequests: ungrouped,
                            }}
                            isExpanded={expandedGroups.has('__other_authors_other__')}
                            onToggle={() => toggleGroup('__other_authors_other__')}
                            depth={1}
                          />
                          {expandedGroups.has('__other_authors_other__') && (
                            <div className="border-t border-gray-200">
                              <PRTable
                                pullRequests={ungrouped}
                                columns={columns}
                                isLoading={false}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <PRTable pullRequests={ungroupedByAuthor} columns={columns} isLoading={false} />
              )}
            </div>
          )}
        </div>
      )}

      {authorGroups.every((g) => g.pullRequests.length === 0) && ungroupedByAuthor.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          No pull requests found
        </div>
      )}
    </div>
  );
}
