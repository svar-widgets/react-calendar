import type {
  FC,
  ReactNode,
  ComponentProps,
  ForwardRefExoticComponent,
  RefAttributes,
} from 'react';
import { Editor as BaseEditor } from '@svar-ui/react-editor';

import type {
  StoreActions,
  CalendarEvent,
  CellCss,
  EventCss,
  EventContentMode,
  ToolbarItem,
  ViewConfig,
  Brandmark,
  CalendarStore,
  FormatFactory,
  EventProjection,
} from '@svar-ui/calendar-store';
import type { EventBus } from '@svar-ui/lib-state';

/* value re-exports */
export {
  getToolbarItems,
  getMenuOptions,
  registerCalendarView,
  WeekViewModel,
  DayViewModel,
  MonthViewModel,
  AgendaViewModel,
  TimelineViewModel,
  ResourcesViewModel,
  YearViewModel,
  toTimeZone,
  fromTimeZone,
  DynamicLoader,
} from '@svar-ui/calendar-store';
export { registerEditorItem } from '@svar-ui/react-editor';
export { parseICal, serializeICal } from '@svar-ui/calendar-ical';
export { RestDataProvider } from '@svar-ui/calendar-provider';

/* type re-exports */
export type {
  ToolbarItem,
  CalendarEvent,
  EditorData,
  CellContext,
  EventContext,
  EventContentMode,
  EventOverflowMode,
  SectionUI,
  CellCss,
  EventCss,
  HistoryState,
} from '@svar-ui/calendar-store';

export declare const version: string;

export declare function getEditorItems(recurring?: boolean): {
  comp: string;
  key: string;
  keys?: string[];
  label: string;
  validation?: (value: { start?: Date; end?: Date }) => boolean;
  validationMessage?: string;
}[];

/* calendar api (bubbled up from components/types) */
export type ViewOption = {
  id: string;
  label: string;
};

export type CalendarPoint = {
  clientX: number;
  clientY: number;
};

type CalendarEventBus = EventBus<StoreActions, keyof StoreActions>;

type CalendarApi = {
  getState: CalendarStore['getState'];
  getReactiveState: CalendarStore['getReactive'];
  exec: CalendarEventBus['exec'];
  fmt: FormatFactory;
  getEvent: CalendarStore['getEvent'];
};

export type CalendarContextApi = CalendarApi & {
  getBrandmark: () => Brandmark | null;
  isCompact: () => boolean;
};

export type CalendarInstanceApi = CalendarApi & {
  getStores: () => { data: CalendarStore };
  setNext: (handler: any) => any;
  intercept: CalendarEventBus['intercept'];
  on: CalendarEventBus['on'];
  detach: CalendarEventBus['detach'];
  getEvents: CalendarStore['getEvents'];
  getEvent: CalendarStore['getEvent'];
};

/* component event handlers derived from store actions
   svelte `onclick` -> react `onClick`; hyphenated action names are camelCased,
   matching the runtime: `add-event` -> `onAddEvent`, `navigate-to` -> `onNavigateTo` */
type Camelize<S extends string> = S extends `${infer Head}-${infer Tail}`
  ? `${Head}${Capitalize<Camelize<Tail>>}`
  : S;

type EventName<K extends string> = `on${Capitalize<Camelize<K>>}`;

export type CalendarActions<TActions extends Record<string, any>> = {
  [K in keyof TActions as EventName<K & string>]?: (ev: TActions[K]) => void;
} & {
  [key: `on${string}`]: (ev?: any) => void;
};

export type CalendarGroup = {
  id: string | number;
  label: string;
  active?: boolean;
  css?: string;
};

export declare const Widget: ForwardRefExoticComponent<
  {
    events: any;
    init?: (api: CalendarInstanceApi) => void;
    readonly?: boolean;
    view?: string;
    views?: (string | ViewConfig)[];
    toolbar?: { items?: ToolbarItem[]; css?: string } | null;
    cellCss?: CellCss;
    eventCss?: EventCss;
    eventContent?: FC<{ event: CalendarEvent; mode: EventContentMode }>;
    date?: Date;
    recurring?: boolean;
    history?: boolean;
    eventProjection?: EventProjection | null;
    children?: ReactNode;
    tooltip?: FC<{ event: CalendarEvent }>;
    eventPopup?: FC<{ event: CalendarEvent; close: () => void }>;
  } & CalendarActions<StoreActions> &
    RefAttributes<CalendarInstanceApi>
>;

export { Widget as Calendar };

export declare const CalendarPanel: FC<{
  calendars: CalendarGroup[];
  accessor?: string;
  open?: boolean;
  onChange?: (detail: {
    value: (string | number)[];
    filter: ((event: Record<string, any>) => boolean) | null;
  }) => void;
}>;

export declare const ContextMenu: ForwardRefExoticComponent<
  {
    options?: any[];
    api?: CalendarInstanceApi;
    resolver?: ((event: any, ev: MouseEvent) => any) | null;
    filter?: ((item: any, event: any) => boolean) | null;
    at?: string;
    children?: ReactNode;
    onClick?: (e: any) => void;
    css?: string;
  } & RefAttributes<{ show: (ev: any, obj?: any) => void }>
>;

export declare const Editor: FC<
  Omit<ComponentProps<typeof BaseEditor>, 'values'> & {
    api: CalendarInstanceApi;
    values?: never;
  }
>;

export declare const Willow: FC<{
  fonts?: boolean;
  children?: ReactNode;
}>;

export declare const WillowDark: FC<{
  fonts?: boolean;
  children?: ReactNode;
}>;
