import { useId } from 'react';
import styled from 'styled-components';
import errorIcon from '../../assets/icons/input-error.svg';

type FieldMark = 'required' | 'optional' | 'none'; // 라벨 옆 표시를 Union Type으로 정의하기.

interface InputProps {
  label: string;                       // 입력칸 위에 보여줄 제목
  value: string;                       // 입력된 값 (부모가 들고 있음)
  onChange?: (value: string) => void;  // 값이 바뀔 때 부모에게 새 값을 알려줌
  placeholder?: string;
  type?: string;                       // 'text', 'url' 등. 기본은 'text'
  error?: string;                      // 있으면 빨간 테두리 + 에러 문구를 보여줌
  mark?: FieldMark;                    // 'required': 별표 / 'optional': 선택 스티커 / 'none': 아무것도 없음
  multiline?: boolean;                 // true면 여러 줄 입력창
  readOnly?: boolean;                  // true면 보기만 하고 수정은 못 함
  maxLength?: number;                  // 입력할 수 있는 최대 글자 수 (없으면 제한 없음)
}

export default function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  mark = 'none',
  multiline = false,
  readOnly = false,
  maxLength,
}: InputProps) {
  const id = useId(); // 라벨과 입력창을 연결할 고유 id를 자동으로 만들어줌

  // 입력창에서 글자가 바뀌면 부모에게 새 값(문자열)만 꺼내서 전달
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <Field>
      <Label htmlFor={id}>
        {label}
        {mark === 'required' && <RequiredMark>*</RequiredMark>}
        {mark === 'optional' && <OptionalBadge>선택</OptionalBadge>}
      </Label>

      {multiline ? (
        <TextAreaBox
          id={id}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          readOnly={readOnly}
          maxLength={maxLength}
          aria-invalid={!!error}
          $hasError={!!error}
        />
      ) : (
        <InputBox
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          readOnly={readOnly}
          maxLength={maxLength}
          aria-invalid={!!error}
          $hasError={!!error}
        />
      )}

      {/* error가 있을 때만 에러 문구를 그림 */}
      {error && (
        <ErrorMessage role="alert">
          <img src={errorIcon} alt="" />
          {error}
        </ErrorMessage>
      )}
    </Field>
  );
}

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 354px;
  max-width: 100%;
  font-family: 'Pretendard', sans-serif;
  line-height: normal;
  letter-spacing: 0;
  text-align: left;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #1e1e1e;
  font-size: 14px;
  font-weight: 700;
`;

const RequiredMark = styled.span`
  color: #d97700;
`;

const OptionalBadge = styled.span`
  margin-left: 2px;
  padding: 1px 6px;
  border-radius: 999px;
  background: #f1f0ec;
  color: #5b5b5b;
  font-size: 12px;
  font-weight: 500;
`;

const InputBox = styled.input<{ $hasError: boolean }>`
  box-sizing: border-box;
  width: 100%;
  height: 48px;
  padding: 0 16px;
  border: ${({ $hasError }) => ($hasError ? '2px solid #b3261e' : '1.5px solid #e7e5e0')};
  border-radius: 12px;
  background: #ffffff;
  color: #1e1e1e;
  font-family: inherit;
  font-size: 15px;

  &::placeholder {
    color: #999896;
  }

  &:focus {
    outline: none;
    border: 2px solid ${({ $hasError }) => ($hasError ? '#b3261e' : '#ffb72b')};
  }
`;

// 프로젝트 소개 입력창. 높이와 안쪽 여백만 InputBox와 다름
const TextAreaBox = styled.textarea<{ $hasError: boolean }>`
  box-sizing: border-box;
  width: 100%;
  height: 112px;
  padding: 12px 16px;
  border: ${({ $hasError }) => ($hasError ? '2px solid #b3261e' : '1.5px solid #e7e5e0')};
  border-radius: 12px;
  background: #ffffff;
  color: #1e1e1e;
  font-family: inherit;
  font-size: 15px;
  resize: none;

  &::placeholder {
    color: #999896;
  }

  &:focus {
    outline: none;
    border: 2px solid ${({ $hasError }) => ($hasError ? '#b3261e' : '#ffb72b')};
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #b3261e;
  font-size: 12px;
`;
