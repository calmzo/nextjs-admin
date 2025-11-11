import request from '@/utils/request';
import type { UserInfo, PageQuery, PageResult, OptionType } from '@/types/api';

const USER_BASE_URL = '/admin/system/users';

export const UserAPI = {
  /**
   * 获取当前用户信息
   * @returns Promise<UserInfo>
   */
  getInfo(): Promise<UserInfo> {
    return request({
      url: `${USER_BASE_URL}/me`,
      method: 'get',
    });
  },

  /**
   * 获取用户分页列表
   * @param queryParams 查询参数
   * @returns Promise<PageResult<UserPageVO>>
   */
  getPage(queryParams: UserPageQuery): Promise<PageResult<UserPageVO>> {
    return request({
      url: `${USER_BASE_URL}/page`,
      method: 'get',
      params: queryParams,
    });
  },

  /**
   * 获取用户表单详情
   * @param userId 用户ID
   * @returns Promise<UserForm>
   */
  getFormData(userId: number): Promise<UserForm> {
    return request({
      url: `${USER_BASE_URL}/${userId}/form`,
      method: 'get',
    });
  },

  /**
   * 添加用户
   * @param data 用户表单数据
   * @returns Promise<void>
   */
  create(data: UserForm): Promise<void> {
    return request({
      url: `${USER_BASE_URL}`,
      method: 'post',
      data,
    });
  },

  /**
   * 修改用户
   * @param id 用户ID
   * @param data 用户表单数据
   * @returns Promise<void>
   */
  update(id: number, data: UserForm): Promise<void> {
    return request({
      url: `${USER_BASE_URL}/${id}`,
      method: 'put',
      data,
    });
  },

  /**
   * 批量删除用户
   * @param ids 用户ID数组
   * @returns Promise<void>
   */
  deleteByIds(ids: number[]): Promise<void> {
    return request({
      url: `${USER_BASE_URL}/${ids.join(',')}`,
      method: 'delete',
    });
  },

  /**
   * 修改用户状态
   * @param id 用户ID
   * @param status 状态
   * @returns Promise<void>
   */
  updateStatus(id: number, status: number): Promise<void> {
    return request({
      url: `${USER_BASE_URL}/${id}/status`,
      method: 'put',
      data: { status },
    });
  },

  /**
   * 重置用户密码
   * @param id 用户ID
   * @param password 新密码
   * @returns Promise<void>
   */
  resetPassword(id: number, password: string): Promise<void> {
    return request({
      url: `${USER_BASE_URL}/${id}/password/reset`,
      method: 'put',
      data: { password },
    });
  },

  /**
   * 获取用户下拉选项
   * @returns Promise<OptionType[]>
   */
  getOptions(): Promise<OptionType[]> {
    return request({
      url: `${USER_BASE_URL}/options`,
      method: 'get',
    });
  },

  /**
   * 导出用户
   * @param queryParams 查询参数
   * @returns Promise<AxiosResponse>
   */
  export(queryParams: UserPageQuery) {
    return request({
      url: `${USER_BASE_URL}/export`,
      method: 'get',
      params: queryParams,
      responseType: 'blob',
    });
  },

  /**
   * 下载用户导入模板
   * @returns Promise<AxiosResponse>
   */
  downloadTemplate() {
    return request({
      url: `${USER_BASE_URL}/template`,
      method: 'get',
      responseType: 'blob',
    });
  },

  /**
   * 导入用户
   * @param deptId 部门ID
   * @param file 导入文件
   * @returns Promise<ImportResult>
   */
  import(deptId: number, file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    
    return request({
      url: `${USER_BASE_URL}/import`,
      method: 'post',
      params: { deptId },
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * 更新用户信息（个人信息）
   * @param data 用户信息数据
   * @returns Promise<UserInfo>
   */
  updateInfo(data: Partial<UserInfo>): Promise<UserInfo> {
    return request({
      url: `${USER_BASE_URL}/info`,
      method: 'put',
      data,
    });
  },

  /**
   * 修改密码（个人信息）
   * @param data 密码修改数据
   * @returns Promise<void>
   */
  changePassword(data: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> {
    return request({
      url: `${USER_BASE_URL}/change-password`,
      method: 'post',
      data,
    });
  },

  /**
   * 上传头像
   * @param file 头像文件
   * @returns Promise<{ avatar: string }>
   */
  uploadAvatar(file: File): Promise<{ avatar: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return request({
      url: `${USER_BASE_URL}/avatar`,
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default UserAPI;

// ==================== 类型定义 ====================

/** 用户分页查询对象 */
export interface UserPageQuery extends PageQuery {
  /** 搜索关键字 */
  keywords?: string;
  /** 用户状态 */
  status?: number;
  /** 部门ID */
  deptId?: number;
  /** 开始时间 */
  createTime?: [string, string];
}

/** 用户分页对象 */
export interface UserPageVO {
  /** 用户ID */
  id: number;
  /** 用户头像URL */
  avatar?: string;
  /** 创建时间 */
  createTime?: string;
  /** 部门ID */
  deptId?: number;
  /** 部门名称 */
  deptName?: string;
  /** 用户邮箱 */
  email?: string;
  /** 性别 */
  gender?: number;
  /** 性别标签 */
  genderLabel?: string;
  /** 手机号 */
  mobile?: string;
  /** 用户昵称 */
  nickname?: string;
  /** 角色名称，多个使用英文逗号(,)分割 */
  roleNames?: string;
  /** 角色名称列表 */
  roleNameList?: string[];
  /** 角色ID列表 */
  roleIdList?: number[];
  /** 用户状态(1:启用;0:禁用) */
  status?: number;
  /** 用户名 */
  username?: string;
  /** 创建人 */
  createBy?: number;
  /** 更新时间 */
  updateTime?: string;
  /** 更新人 */
  updateBy?: number;
  /** 是否删除 */
  isDeleted?: number;
  /** 微信openid */
  openid?: string;
}

/** 用户表单类型 */
export interface UserForm {
  /** 用户ID */
  id?: number;
  /** 用户头像 */
  avatar?: string;
  /** 部门ID */
  deptId?: number;
  /** 邮箱 */
  email?: string;
  /** 性别 */
  gender?: number;
  /** 手机号 */
  mobile?: string;
  /** 昵称 */
  nickname?: string;
  /** 角色ID集合 */
  roleIds?: number[];
  /** 用户状态(1:正常;0:禁用) */
  status?: number;
  /** 用户名 */
  username?: string;
  /** 密码 */
  password?: string;
}

/** 用户状态枚举 */
export enum UserStatus {
  DISABLED = 0,
  ENABLED = 1,
}

/** 用户性别枚举 */
export enum UserGender {
  UNKNOWN = 0,
  MALE = 1,
  FEMALE = 2,
}

/** 用户状态选项 */
export const USER_STATUS_OPTIONS = [
  { label: '禁用', value: UserStatus.DISABLED, color: 'error' },
  { label: '正常', value: UserStatus.ENABLED, color: 'success' },
];

/** 用户性别选项 */
export const USER_GENDER_OPTIONS = [
  { label: '请选择', value: UserGender.UNKNOWN },
  { label: '男', value: UserGender.MALE },
  { label: '女', value: UserGender.FEMALE },
];

/** 用户导入结果 */
export interface ImportResult {
  code: string;
  validCount: number;
  invalidCount: number;
  messageList: string[];
}
