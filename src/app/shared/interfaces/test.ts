
export interface TestPointTemplate {
  id: string;
  component_name: string;
  point_label: string;
  expected_voltage: number;
  tolerance_percent: number;
}

export interface PSUTemplateResponse {
  sku: string;
  model: string;
  electrical_checkpoints: TestPointTemplate[];
  required_voltages: {
    system_voltage: string;
    max_wattage: string;
  };
}
