import { TreeNode } from "primeng/primeng";

export class Section implements TreeNode {
  label?: string;
  data?: any;
  icon?: string;
  expandedIcon?: string;
  collapsedIcon?: string;
  children?: TreeNode[];
  leaf?: boolean;
  style?: string;
  styleClass?: string;
  expanded?: boolean;
  type?: string;
  parent?: TreeNode;
}
