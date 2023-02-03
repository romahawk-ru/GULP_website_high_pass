// Пример реализации боковой панели на основе наследования от collection.Item.
// Боковая панель отображает информацию, которую мы ей передали.
ymaps.modules.define('Panel', [
  'util.augment',
  'collection.Item'
], function (provide, augment, item) {
  // Создаем собственный класс.
  var Panel = function (options) {
      Panel.superclass.constructor.call(this, options);
  };

  // И наследуем его от collection.Item.
  augment(Panel, item, {
      onAddToMap: function (map) {
          Panel.superclass.onAddToMap.call(this, map);
          this.getParent().getChildElement(this).then(this._onGetChildElement, this);
          // Добавим отступы на карту.
          // Отступы могут учитываться при установке текущей видимой области карты,
          // чтобы добиться наилучшего отображения данных на карте.
          map.margin.addArea({
              top: 0,
              left: 0,
              width: '250px',
              height: '100%'
          })
      },

      onRemoveFromMap: function (oldMap) {
          if (this._$control) {
              this._$control.remove();
          }
          Panel.superclass.onRemoveFromMap.call(this, oldMap);
      },

      _onGetChildElement: function (parentDomContainer) {
          // Создаем HTML-элемент с текстом.
          // По-умолчанию HTML-элемент скрыт.
          this._$control = $(`<div class="customControl"><div class="content"><h3>Студия «High pass»</h3><p>107045, Москва, Даев переулок, дом 41, бизнес-центр «Даев Плаза», этаж 8, офис № 82</p><a href="tel:+749542423532"><svg class="contacts-inner-item__absolut-link-icon"><use xlink:href="./img/svg/sprite.svg#handset-icon"></use></svg><span>+7 495 424-23-532<span></a></div><div class="closeButton"></div></div>`).appendTo(parentDomContainer);
          this._$content = $('.content');
          // При клике по крестику будем скрывать панель.
          $('.closeButton').on('click', this._onClose);
      },
      _onClose: function () {
          $('.customControl').css('display', 'none');
      },
      // Метод задания контента панели.
      setContent: function (text) {
          // При задании контента будем показывать панель.
          this._$control.css('display', 'flex');
          this._$content.html(text);
      }
  });

  provide(Panel);
});

ymaps.ready(['Panel']).then(function () {
  var map = new ymaps.Map('map', {
    center: [55.76303411040442,37.62163455480952],
    zoom: 14,
    controls: []
  });
  // Создадим контент для меток.
    var firstOffice = '<h3>Студия «High pass»</h3>' +
      '<p>107045, Москва, Даев переулок, дом 41, бизнес-центр «Даев Плаза», этаж 8, офис № 82</p>' +
      `<a href="tel:+749542423532">
      <svg class="contacts-inner-item__absolut-link-icon">
        <use xlink:href="./img/svg/sprite.svg#handset-icon"></use>
      </svg>
      <span>+7 495 424-23-532<span>
      </a>`;
  // Создадим и добавим панель на карту.
  var panel = new ymaps.Panel();
  map.controls.add(panel, {
    float: 'left'
  });
  // Создадим коллекцию геообъектов.
  var collection = new ymaps.GeoObjectCollection(null, {
    // Запретим появление балуна.
    hasBalloon: false,
    iconLayout: 'default#image',
    iconImageHref: 'https://avatars.mds.yandex.net/i?id=bdbfa0dcffc75a97161757f2ae3e304d-4055807-images-thumbs&n=13',
    iconImageSize: [14, 14],
    iconImageOffset: [-8, -7]
  });
  // Добавим геообъекты в коллекцию.
  collection
    .add(new ymaps.Placemark([55.769255, 37.638325], {
      balloonContent: firstOffice
    }));
  // Добавим коллекцию на карту.
    map.geoObjects.add(collection);

  // Подпишемся на событие клика по коллекции.
  collection.events.add('click', function (e) {
    // Получим ссылку на геообъект, по которому кликнул пользователь.
    var target = e.get('target');
    // Зададим контент боковой панели.
    panel.setContent(target.properties.get('balloonContent'));
  });
});
