export interface IActivity {
  text: string,
  href?: string,
  date: string,
  tags: ITag[],
  assignee: IAssignee,
  className?: string
};

export interface ITag {
  name: string,
  priority: string,
  colorScheme?: string,
  className?: string
}

export interface IAssignee {
  name: string,
  href?: string,
  avatar?: string,
  className?: string
}