import { RepositoryItem } from '@src/components/repositoryItem/repositoryItem';
import { Col, Input, List, Row, Select } from 'antd';
import * as React from 'react';

export interface RepositoryListProps {
  repositories: Repository[];
}

interface RepositoryListState {
  searchTerm: string;
  sortField: SortFields;
  filteredTopics: string[];
}

enum SortFields {
  NAME = 'name',
  WATCHERS = 'watchers',
  STARS = 'stars',
}

export type Sorters = {
  [P in SortFields]: (a: Repository, b: Repository) => number;
};

const SORTERS: Sorters = {
  name: (a, b) => a.name.localeCompare(b.name),
  stars: (a, b) => b.stargazers_count - a.stargazers_count,
  watchers: (a, b) => b.watchers_count - a.watchers_count,
};

export class RepositoryList extends React.Component<RepositoryListProps, RepositoryListState> {
  constructor(props: RepositoryListProps) {
    super(props);

    this.state = {
      searchTerm: '',
      sortField: SortFields.NAME,
      filteredTopics: [],
    };
  }

  public render() {
    const topics = this.props.repositories.reduce((ret, repo) => {
      repo.topics.forEach((topic) => ret.add(topic));
      return ret;
    }, new Set<string>());

    const topicOpts = [...topics].map((topic) => <Select.Option key={topic}>{topic}</Select.Option>);

    const dataSource = this.getDataSource();

    return (
      <div>
        <Row type='flex' justify='space-between'>
          <Col span={6}>
            <Input.Search
              value={this.state.searchTerm}
              onChange={(e) => this.setState({ searchTerm: e.target.value })}
              style={{ width: 300 }}
              placeholder='search repositories'
            />
          </Col>
          <Col span={6}>
            Topics: <Select
              value={this.state.filteredTopics}
              mode='multiple'
              style={{ width: '80%' }}
              placeholder='Filter on topics'
              onChange={(filteredTopics: string[]) => this.setState({ filteredTopics })}
            >
              {topicOpts}
            </Select>
          </Col>
          <Col span={4}>
            Sort By: <Select
              value={this.state.sortField}
              style={{ width: 130 }}
              placeholder='Sort By'
              onChange={(e: SortFields) => { this.setState({ sortField: e }); }}
            >
              <Select.Option value={SortFields.NAME}>Name</Select.Option>
              <Select.Option value={SortFields.STARS}>Stars</Select.Option>
              <Select.Option value={SortFields.WATCHERS}>Watchers</Select.Option>
            </Select>
          </Col>
        </Row>

        <List
          dataSource={dataSource}
          renderItem={this.renderItem}
        />
      </div>
    );
  }

  private getDataSource() {
    return this.props.repositories.filter((repo) => {
      const term = this.state.searchTerm.toLowerCase();
      const include =
        (
          repo.name.toLowerCase().includes(term)
          || repo.description.includes(term)
          || repo.topics.filter((topic) => topic.includes(term)).length
        )
        &&
        (
          !this.state.filteredTopics.length
          || repo.topics.filter((topic) => this.state.filteredTopics.includes(topic)).length
        );
      return include;
    }).sort(SORTERS[this.state.sortField]);
  }

  private renderItem(item: Repository) {
    return <RepositoryItem repo={item} />;
  }
}
