import babyLion from '../../assets/images/avatar/lion.png';
import adultLion from '../../assets/images/avatar/lion-2.png';
import elephant from '../../assets/images/avatar/elephant.png';
import giraffe from '../../assets/images/avatar/giraffe.png';
import zebra from '../../assets/images/avatar/zebra.png';
import meerkat from '../../assets/images/avatar/meerkat.png';
import cheetah from '../../assets/images/avatar/cheetah.png';
import hippo from '../../assets/images/avatar/hippo.png';
import ostrich from '../../assets/images/avatar/ostrich.png';

// 캐릭터 선택 순서와 이미지
export const characters = [
  { id: 'baby-lion', name: '아기사자', image: babyLion },
  { id: 'adult-lion', name: '어른사자', image: adultLion },
  { id: 'elephant', name: '코끼리', image: elephant },
  { id: 'giraffe', name: '기린', image: giraffe },
  { id: 'zebra', name: '얼룩말', image: zebra },
  { id: 'meerkat', name: '미어캣', image: meerkat },
  { id: 'cheetah', name: '치타', image: cheetah },
  { id: 'hippo', name: '하마', image: hippo },
  { id: 'ostrich', name: '타조', image: ostrich },
];

// 지역 선택 창의 시·도 목록
export const regions = [
  '서울', '경기', '인천', '강원', '대전', '세종',
  '충북', '충남', '광주', '전북', '전남', '대구',
  '부산', '울산', '경북', '경남', '제주',
];