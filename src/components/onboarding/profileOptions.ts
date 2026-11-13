import babyLion from '../../assets/images/avatar/lion.png';
import adultLion from '../../assets/images/avatar/lion-2.png';
import elephant from '../../assets/images/avatar/elephant.png';
import giraffe from '../../assets/images/avatar/giraffe.png';
import zebra from '../../assets/images/avatar/zebra.png';
import meerkat from '../../assets/images/avatar/meerkat.png';
import cheetah from '../../assets/images/avatar/cheetah.png';
import hippo from '../../assets/images/avatar/hippo.png';
import ostrich from '../../assets/images/avatar/ostrich.png';

// 서버에 저장하는 apiId는 기존 사용자 캐릭터가 바뀌지 않도록 고정한다.
export const characters = [
  { id: 'baby-lion', apiId: 1, name: '아기사자', image: babyLion },
  { id: 'adult-lion', apiId: 2, name: '어른사자', image: adultLion },
  { id: 'elephant', apiId: 3, name: '코끼리', image: elephant },
  { id: 'giraffe', apiId: 4, name: '기린', image: giraffe },
  { id: 'zebra', apiId: 5, name: '얼룩말', image: zebra },
  { id: 'meerkat', apiId: 6, name: '미어캣', image: meerkat },
  { id: 'cheetah', apiId: 7, name: '치타', image: cheetah },
  { id: 'hippo', apiId: 8, name: '하마', image: hippo },
  { id: 'ostrich', apiId: 9, name: '타조', image: ostrich },
];

// 지역 선택 창의 시·도 목록
export const regions = [
  '서울', '경기', '인천', '강원', '대전', '세종',
  '충북', '충남', '광주', '전북', '전남', '대구',
  '부산', '울산', '경북', '경남', '제주',
];