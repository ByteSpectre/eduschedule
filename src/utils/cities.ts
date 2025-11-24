export interface City {
  id: string;
  name: string;
  universities: string[];
}

export const cities: City[] = [
  {
    id: 'moscow',
    name: 'Москва',
    universities: ['МГУ', 'МГТУ им. Баумана', 'РЭУ им. Плеханова', 'НИУ ВШЭ']
  },
  {
    id: 'spb',
    name: 'Санкт-Петербург',
    universities: ['СПбГУ', 'ИТМО', 'Политех', 'ЛЭТИ']
  },
  {
    id: 'kazan',
    name: 'Казань',
    universities: ['КФУ', 'КНИТУ', 'КГЭУ']
  },
  {
    id: 'ekb',
    name: 'Екатеринбург',
    universities: ['УрФУ', 'УрГЭУ', 'УрГУПС']
  },
  {
    id: 'nsk',
    name: 'Новосибирск',
    universities: ['НГУ', 'НГТУ', 'СибГУТИ']
  },
  {
    id: 'nn',
    name: 'Нижний Новгород',
    universities: ['ННГУ им. Лобачевского', 'НГТУ им. Алексеева']
  }
];

