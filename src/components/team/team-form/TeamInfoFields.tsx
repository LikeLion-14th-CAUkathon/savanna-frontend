import styled from 'styled-components';
import Notice from '../../common/Notice';
import Input from '../../common/Input';
import CollapseToggle from '../../common/CollapseToggle';
import type { TeamForm, TeamFormErrors } from '../../../utils/teamForm';

interface TeamInfoFieldsProps {
  form: TeamForm;
  onChange: (key: keyof TeamForm, value: string) => void;
  errors: TeamFormErrors; // 보여줄 오류 문구만 넘긴다
}

// B01 팀 생성 · B02 팀 정보 수정의 안내 문구 + 입력칸 (필수 3개 + 접히는 추가 정보 3개)
export default function TeamInfoFields({ form, onChange, errors }: TeamInfoFieldsProps) {
  const field = (key: keyof TeamForm) => ({
    value: form[key],
    onChange: (value: string) => onChange(key, value),
    error: errors[key],
  });

  return (
    <>
      <Notice />

      <Input label="팀 이름" mark="required" placeholder="예) 사바나 탐험대" {...field('name')} />
      <Input
        label="프로젝트 이름"
        mark="required"
        placeholder="예) AI 수면 습관 코치"
        {...field('projectName')}
      />
      <Input
        label="프로젝트 소개"
        mark="required"
        multiline
        placeholder="어떤 문제를 누구를 위해 해결하는 프로젝트인지, 주요 기능과 함께 적어 주세요."
        {...field('projectIntro')}
      />

      <CollapseToggle defaultExpanded>
        <ExtraFields>
          <Input
            label="깃허브 링크"
            mark="optional"
            type="url"
            placeholder="https://"
            {...field('githubUrl')}
          />
          <Input
            label="발표자료 링크"
            mark="optional"
            type="url"
            placeholder="https://"
            {...field('presentationUrl')}
          />
          <Input label="기술 스택" mark="optional" placeholder="예) React, Node.js" {...field('stack')} />
        </ExtraFields>
      </CollapseToggle>
    </>
  );
}

// 추가 정보 펼침 영역. 접기 줄과 첫 입력칸 사이도 20px
const ExtraFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 20px;
`;
