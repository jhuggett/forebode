

export enum EventTypeName {
  Poo = 'poo',
  Pee = 'pee'
}

export interface EventType {
  name: EventTypeName,
  displayName: string
}

export const PooEventType: EventType = {
  name: EventTypeName.Poo,
  displayName: 'Built a brown monument'
}

export const PeeEventType: EventType = {
  name: EventTypeName.Pee,
  displayName: 'Watered the lawn'
}

const EventTypeNameMap: Map<EventTypeName, EventType> = new Map([
  [EventTypeName.Pee, PeeEventType],
  [EventTypeName.Poo, PooEventType]
])

export const getEventTypeForName = (name: string) => 
  EventTypeNameMap.get(name as EventTypeName)

export const AllEventTypes = [
  PooEventType,
  PeeEventType
]