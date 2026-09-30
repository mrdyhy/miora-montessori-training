export const PRINCIPLE_LABELS: Record<string, string> = {
  adult_self_control: "Người lớn tự điều chỉnh",
  concentration: "Bảo vệ sự tập trung",
  emotional_regulation: "Điều hòa cảm xúc",
  freedom_with_limits: "Tự do trong giới hạn",
  grace_and_courtesy: "Ân cần & lịch sự",
  independence: "Nuôi dưỡng tính độc lập",
  intrinsic_motivation: "Nuôi dưỡng động lực nội tại",
  minimal_help: "Giúp vừa đủ",
  natural_consequences: "Hệ quả tự nhiên",
  observation: "Quan sát trước khi can thiệp",
  prepared_environment: "Môi trường được chuẩn bị",
  respect: "Tôn trọng trẻ",
  safety: "Bảo đảm an toàn",
  self_correction: "Tự nhận ra và sửa lỗi",
  work_cycle: "Tôn trọng chu kỳ làm việc",
};

export function hasPrincipleLabel(tag: string): boolean {
  return Object.hasOwn(PRINCIPLE_LABELS, tag);
}

export function getPrincipleLabels(tags: readonly string[]): string[] {
  return tags.map((tag) => PRINCIPLE_LABELS[tag] ?? "Nguyên tắc Montessori");
}
