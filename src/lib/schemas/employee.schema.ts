/**
 * Employee Master (社員マスタ) validation schema
 */
import { z } from "zod";

export const employeeSchema = z.object({
  loginId: z
    .string()
    .min(1, "ログインIDは必須項目です")
    .max(50, "ログインIDは50文字以内で入力してください")
    .regex(/^[a-zA-Z0-9._-]+$/, "ログインIDは英数字・ドット・ハイフンのみ使用可能です"),
  password: z
    .string()
    .min(1, "パスワードは必須項目です")
    .min(6, "パスワードは6文字以上で入力してください"),
  empName: z
    .string()
    .min(1, "氏名は必須項目です")
    .max(100, "氏名は100文字以内で入力してください"),
  deptCode: z.string().min(1, "部署を選択してください"),
  roleType: z.string().min(1, "権限種別を選択してください"),
  email: z
    .string()
    .email("正しいメールアドレス形式で入力してください")
    .or(z.literal(""))
    .optional(),
  isActive: z.boolean().default(true),
  remarks: z.string().max(200, "備考は200文字以内で入力してください").optional(),
});

// For editing — password is optional
export const employeeEditSchema = employeeSchema.extend({
  password: z
    .string()
    .min(6, "パスワードは6文字以上で入力してください")
    .or(z.literal(""))
    .optional(),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
export type EmployeeEditFormValues = z.infer<typeof employeeEditSchema>;
