"System Administrator"
"Chief Executive Officer (CEO)"
"Sales Representative"
"Customer"

CHOICES = [
      ('Netflix', 'Netflix'),
      ('Browser', 'Browser'),
      ('YouTube', 'YouTube'),
      ('HBO Max', 'HBO Max'),
      ('Google TV', 'Google TV'),
      ('Disney Plus', 'Disney Plus'),
  ]


  CHOICES = [
        ('2K', '2K UHD'),
        ('4K', '4K UHD'),
        ('8K', '8K UHD'),
        ('HD', 'HD Ready'),
        ('FHD', 'Full HD')
    ]

    CHOICES=[
          ('LED', 'LED'),
          ('OLED', 'OLED'),
          ('QLED', 'QLED')
      ]

      CHOICES = [
            ('HDMI', 'HDMI'),
            ('Wi-Fi', 'Wi-Fi'),
            ('Bluetooth', 'Bluetooth'),
            ('Ethernet', 'Ethernet'),
            ('USB', 'USB'),
            ('RF', 'RF'),
            ('AV', 'AV'),
            ('Coaxial', 'Coaxial'),
            ('Screen Mirroring', 'Screen Mirroring')
        ]


        const conditions: Condition[] = [
          {
            name: 'New',
            description: 'Original packaging, never used.'
          },
          {
            name: 'Refurbished',
            description: 'Tested and restored to full functionality.'
          },
          {
            name: 'Used',
            description: 'Shows signs of previous ownership.'
          },
          {
            name: 'Damaged',
            description: 'Functional issues or heavy physical wear.'
          }
        ];
