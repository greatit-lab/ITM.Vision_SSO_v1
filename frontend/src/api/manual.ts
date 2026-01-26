// frontend/src/api/manual.ts
import http from './http'; 

export interface ManualSectionDto {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  content: string;
  imageUrl?: string;
  imageCaption?: string;
  sortOrder?: number;
}

export const manualApi = {
  getAll: async () => {
    // SSO Backend의 ManualController 호출
    const { data } = await http.get<ManualSectionDto[]>('/manual');
    return data;
  },

  saveAll: async (sections: ManualSectionDto[]) => {
    // SSO Backend의 ManualController 호출
    const { data } = await http.put('/manual', { sections });
    return data;
  }
};
