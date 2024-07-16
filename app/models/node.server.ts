import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { nodes } from "~/db/schema";
import type { DeviceNodeType, NewNode, Node } from "~/db/schema";
