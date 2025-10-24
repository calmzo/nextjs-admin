import request from '@/utils/request';
import type { UserInfo } from '@/types/api';

const USER_BASE_URL = '/prod-api/admin/system/users';

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
   * 更新用户信息
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
   * 修改密码
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
