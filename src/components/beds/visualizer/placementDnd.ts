export const PLANT_DRAG_MIME = 'application/x-plant-id';

export function readDraggedPlantId(dataTransfer: DataTransfer | null): string {
  if (!dataTransfer) {
    return '';
  }
  return (
    dataTransfer.getData(PLANT_DRAG_MIME) || dataTransfer.getData('text/plain')
  );
}
