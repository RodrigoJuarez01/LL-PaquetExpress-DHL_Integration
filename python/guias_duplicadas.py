import re
import pandas as pd
from datetime import datetime

# ==========================================
# 1. PEGA AQUÍ TUS LOGS DE CATALYST
# ==========================================
raw_logs = """
paquetexpress_label_request_function	21-01-2026 13:17:49:547 CST	info	trackingNumber 411233439030
paquetexpress_label_request_function	21-01-2026 13:17:49:546 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233439030&measure=4x6
paquetexpress_label_request_function	21-01-2026 13:17:49:342 CST	info	Execution started at:  1769023069342
paquetexpress_label_request_function	21-01-2026 13:06:24:757 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233437404&measure=4x6
paquetexpress_label_request_function	21-01-2026 13:06:24:757 CST	info	trackingNumber 411233437404
paquetexpress_label_request_function	21-01-2026 13:06:24:551 CST	info	Execution started at:  1769022384551
paquetexpress_label_request_function	21-01-2026 12:51:32:523 CST	info	trackingNumber 211233435109
paquetexpress_label_request_function	21-01-2026 12:51:32:522 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233435109&measure=4x6
paquetexpress_label_request_function	21-01-2026 12:51:32:318 CST	info	Execution started at:  1769021492317
paquetexpress_label_request_function	21-01-2026 12:44:03:723 CST	info	trackingNumber 211233433959
paquetexpress_label_request_function	21-01-2026 12:44:03:723 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233433959&measure=4x6
paquetexpress_label_request_function	21-01-2026 12:44:03:520 CST	info	Execution started at:  1769021043520
paquetexpress_label_request_function	21-01-2026 12:37:21:334 CST	info	trackingNumber 211233433094
paquetexpress_label_request_function	21-01-2026 12:37:21:333 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233433094&measure=4x6
paquetexpress_label_request_function	21-01-2026 12:37:21:057 CST	info	Execution started at:  1769020641056
paquetexpress_label_request_function	21-01-2026 12:25:05:949 CST	info	trackingNumber 211233431206
paquetexpress_label_request_function	21-01-2026 12:25:05:949 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233431206&measure=4x6
paquetexpress_label_request_function	21-01-2026 12:25:05:738 CST	info	Execution started at:  1769019905737
paquetexpress_label_request_function	21-01-2026 12:15:48:249 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233429957&measure=4x6
paquetexpress_label_request_function	21-01-2026 12:15:48:249 CST	info	trackingNumber 111233429957
paquetexpress_label_request_function	21-01-2026 12:15:48:043 CST	info	Execution started at:  1769019348043
paquetexpress_label_request_function	21-01-2026 12:10:26:336 CST	info	trackingNumber 111233428871
paquetexpress_label_request_function	21-01-2026 12:10:26:336 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233428871&measure=4x6
paquetexpress_label_request_function	21-01-2026 12:10:26:137 CST	info	Execution started at:  1769019026137
paquetexpress_label_request_function	21-01-2026 12:05:19:521 CST	info	trackingNumber 111233428216
paquetexpress_label_request_function	21-01-2026 12:05:19:521 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233428216&measure=4x6
paquetexpress_label_request_function	21-01-2026 12:05:19:250 CST	info	Execution started at:  1769018719249
paquetexpress_label_request_function	21-01-2026 11:43:09:935 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233425240&measure=4x6
paquetexpress_label_request_function	21-01-2026 11:43:09:935 CST	info	trackingNumber 111233425240
paquetexpress_label_request_function	21-01-2026 11:43:09:728 CST	info	Execution started at:  1769017389728
paquetexpress_label_request_function	21-01-2026 11:40:42:835 CST	info	trackingNumber 111233424912
paquetexpress_label_request_function	21-01-2026 11:40:42:834 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233424912&measure=4x6
paquetexpress_label_request_function	21-01-2026 11:40:42:633 CST	info	Execution started at:  1769017242633
paquetexpress_label_request_function	21-01-2026 11:38:26:007 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233424638&measure=4x6
paquetexpress_label_request_function	21-01-2026 11:38:26:007 CST	info	trackingNumber 111233424638
paquetexpress_label_request_function	21-01-2026 11:38:25:810 CST	info	Execution started at:  1769017105809
paquetexpress_label_request_function	21-01-2026 11:32:13:620 CST	info	trackingNumber 111233423781
paquetexpress_label_request_function	21-01-2026 11:32:13:619 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233423781&measure=4x6
paquetexpress_label_request_function	21-01-2026 11:32:13:420 CST	info	Execution started at:  1769016733419
paquetexpress_label_request_function	21-01-2026 11:13:31:271 CST	info	trackingNumber 111233421280
paquetexpress_label_request_function	21-01-2026 11:13:31:271 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233421280&measure=4x6
paquetexpress_label_request_function	21-01-2026 11:13:31:271 CST	info	Execution started at:  1769015611271
paquetexpress_label_request_function	21-01-2026 11:12:44:121 CST	info	trackingNumber 411233421179
paquetexpress_label_request_function	21-01-2026 11:12:44:120 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233421179&measure=4x6
paquetexpress_label_request_function	21-01-2026 11:12:43:918 CST	info	Execution started at:  1769015563917
paquetexpress_label_request_function	21-01-2026 11:02:55:346 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233419925&measure=4x6
paquetexpress_label_request_function	21-01-2026 11:02:55:346 CST	info	Execution started at:  1769014975346
paquetexpress_label_request_function	21-01-2026 11:02:55:346 CST	info	trackingNumber 111233419925
paquetexpress_label_request_function	21-01-2026 11:02:55:271 CST	info	trackingNumber 111233419924
paquetexpress_label_request_function	21-01-2026 11:02:55:271 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233419924&measure=4x6
paquetexpress_label_request_function	21-01-2026 11:02:55:271 CST	info	Execution started at:  1769014975271
paquetexpress_label_request_function	21-01-2026 11:02:29:624 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233419808&measure=4x6
paquetexpress_label_request_function	21-01-2026 11:02:29:624 CST	info	trackingNumber 211233419808
paquetexpress_label_request_function	21-01-2026 11:02:29:422 CST	info	Execution started at:  1769014949421
paquetexpress_label_request_function	21-01-2026 10:59:12:668 CST	info	Execution started at:  1769014752668
paquetexpress_label_request_function	21-01-2026 10:59:12:668 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233419360&measure=4x6
paquetexpress_label_request_function	21-01-2026 10:59:12:668 CST	info	trackingNumber 211233419360
paquetexpress_label_request_function	21-01-2026 10:57:59:127 CST	info	trackingNumber 111233419239
paquetexpress_label_request_function	21-01-2026 10:57:59:126 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233419239&measure=4x6
paquetexpress_label_request_function	21-01-2026 10:57:59:126 CST	info	Execution started at:  1769014679126
paquetexpress_label_request_function	21-01-2026 10:57:59:106 CST	info	Execution started at:  1769014679106
paquetexpress_label_request_function	21-01-2026 10:57:59:106 CST	info	trackingNumber 111233419240
paquetexpress_label_request_function	21-01-2026 10:57:59:106 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233419240&measure=4x6
paquetexpress_label_request_function	21-01-2026 10:56:50:996 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233419093&measure=4x6
paquetexpress_label_request_function	21-01-2026 10:56:50:996 CST	info	trackingNumber 411233419093
paquetexpress_label_request_function	21-01-2026 10:56:50:803 CST	info	Execution started at:  1769014610803
paquetexpress_label_request_function	21-01-2026 10:14:05:363 CST	info	Execution started at:  1769012045363
paquetexpress_label_request_function	21-01-2026 10:14:05:363 CST	info	trackingNumber 111233414111
paquetexpress_label_request_function	21-01-2026 10:14:05:363 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233414111&measure=4x6
paquetexpress_label_request_function	21-01-2026 10:13:49:083 CST	info	trackingNumber 211233414086
paquetexpress_label_request_function	21-01-2026 10:13:49:083 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233414086&measure=4x6
paquetexpress_label_request_function	21-01-2026 10:13:48:887 CST	info	Execution started at:  1769012028886
paquetexpress_label_request_function	21-01-2026 10:10:08:937 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233413760&measure=4x6
paquetexpress_label_request_function	21-01-2026 10:10:08:937 CST	info	trackingNumber 211233413760
paquetexpress_label_request_function	21-01-2026 10:10:08:728 CST	info	Execution started at:  1769011808728
paquetexpress_label_request_function	21-01-2026 10:00:13:224 CST	info	trackingNumber 111233412847
paquetexpress_label_request_function	21-01-2026 10:00:13:223 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233412847&measure=4x6
paquetexpress_label_request_function	21-01-2026 10:00:13:018 CST	info	Execution started at:  1769011213018
paquetexpress_label_request_function	21-01-2026 09:40:16:498 CST	info	trackingNumber 211233411093
paquetexpress_label_request_function	21-01-2026 09:40:16:497 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233411093&measure=4x6
paquetexpress_label_request_function	21-01-2026 09:40:16:297 CST	info	Execution started at:  1769010016296
paquetexpress_label_request_function	21-01-2026 09:21:19:165 CST	info	Execution started at:  1769008879165
paquetexpress_label_request_function	21-01-2026 09:21:19:165 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233409099&measure=4x6
paquetexpress_label_request_function	21-01-2026 09:21:19:165 CST	info	trackingNumber 111233409099
paquetexpress_label_request_function	21-01-2026 09:20:42:735 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233409055&measure=4x6
paquetexpress_label_request_function	21-01-2026 09:20:42:735 CST	info	trackingNumber 211233409055
paquetexpress_label_request_function	21-01-2026 09:20:42:525 CST	info	Execution started at:  1769008842524
paquetexpress_label_request_function	21-01-2026 09:16:34:228 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233408833&measure=4x6
paquetexpress_label_request_function	21-01-2026 09:16:34:228 CST	info	trackingNumber 111233408833
paquetexpress_label_request_function	21-01-2026 09:16:34:021 CST	info	Execution started at:  1769008594021
paquetexpress_label_request_function	21-01-2026 09:12:19:690 CST	info	trackingNumber 111233408392
paquetexpress_label_request_function	21-01-2026 09:12:19:689 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233408392&measure=4x6
paquetexpress_label_request_function	21-01-2026 09:12:19:487 CST	info	Execution started at:  1769008339487
paquetexpress_label_request_function	21-01-2026 09:06:26:734 CST	info	trackingNumber 111233408120
paquetexpress_label_request_function	21-01-2026 09:06:26:734 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233408120&measure=4x6
paquetexpress_label_request_function	21-01-2026 09:06:26:529 CST	info	Execution started at:  1769007986529
paquetexpress_label_request_function	21-01-2026 09:01:37:934 CST	info	trackingNumber 111233407845
paquetexpress_label_request_function	21-01-2026 09:01:37:934 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233407845&measure=4x6
paquetexpress_label_request_function	21-01-2026 09:01:37:731 CST	info	Execution started at:  1769007697731
paquetexpress_label_request_function	20-01-2026 17:50:39:831 CST	info	trackingNumber 411233390861
paquetexpress_label_request_function	20-01-2026 17:50:39:830 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233390861&measure=4x6
paquetexpress_label_request_function	20-01-2026 17:50:39:627 CST	info	Execution started at:  1768953039626
paquetexpress_label_request_function	20-01-2026 17:36:59:326 CST	info	trackingNumber 411233388968
paquetexpress_label_request_function	20-01-2026 17:36:59:325 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233388968&measure=4x6
paquetexpress_label_request_function	20-01-2026 17:36:59:125 CST	info	Execution started at:  1768952219125
paquetexpress_label_request_function	20-01-2026 17:23:37:231 CST	info	trackingNumber 411233386789
paquetexpress_label_request_function	20-01-2026 17:23:37:231 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233386789&measure=4x6
paquetexpress_label_request_function	20-01-2026 17:23:37:096 CST	info	Execution started at:  1768951417095
paquetexpress_label_request_function	20-01-2026 16:52:42:187 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233380435&measure=4x6
paquetexpress_label_request_function	20-01-2026 16:52:42:187 CST	info	trackingNumber 411233380435
paquetexpress_label_request_function	20-01-2026 16:52:41:984 CST	info	Execution started at:  1768949561983
paquetexpress_label_request_function	20-01-2026 15:17:44:846 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233364640&measure=4x6
paquetexpress_label_request_function	20-01-2026 15:17:44:846 CST	info	trackingNumber 411233364640
paquetexpress_label_request_function	20-01-2026 15:17:44:642 CST	info	Execution started at:  1768943864641
paquetexpress_label_request_function	20-01-2026 12:01:54:634 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233335761&measure=4x6
paquetexpress_label_request_function	20-01-2026 12:01:54:634 CST	info	trackingNumber 411233335761
paquetexpress_label_request_function	20-01-2026 12:01:54:428 CST	info	Execution started at:  1768932114428
paquetexpress_label_request_function	20-01-2026 11:50:39:049 CST	info	trackingNumber 411233334180
paquetexpress_label_request_function	20-01-2026 11:50:39:049 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233334180&measure=4x6
paquetexpress_label_request_function	20-01-2026 11:50:38:842 CST	info	Execution started at:  1768931438841
paquetexpress_label_request_function	20-01-2026 11:41:44:846 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233332820&measure=4x6
paquetexpress_label_request_function	20-01-2026 11:41:44:846 CST	info	trackingNumber 411233332820
paquetexpress_label_request_function	20-01-2026 11:41:44:645 CST	info	Execution started at:  1768930904644
paquetexpress_label_request_function	20-01-2026 11:38:21:274 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233332283&measure=4x6
paquetexpress_label_request_function	20-01-2026 11:38:21:274 CST	info	trackingNumber 411233332283
paquetexpress_label_request_function	20-01-2026 11:38:21:089 CST	info	Execution started at:  1768930701088
paquetexpress_label_request_function	20-01-2026 11:35:04:948 CST	info	trackingNumber 411233331795
paquetexpress_label_request_function	20-01-2026 11:35:04:948 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233331795&measure=4x6
paquetexpress_label_request_function	20-01-2026 11:35:04:744 CST	info	Execution started at:  1768930504743
paquetexpress_label_request_function	20-01-2026 11:24:23:138 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233330374&measure=4x6
paquetexpress_label_request_function	20-01-2026 11:24:23:138 CST	info	trackingNumber 111233330374
paquetexpress_label_request_function	20-01-2026 11:24:22:934 CST	info	Execution started at:  1768929862933
paquetexpress_label_request_function	20-01-2026 11:22:12:850 CST	info	trackingNumber 111233330083
paquetexpress_label_request_function	20-01-2026 11:22:12:850 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233330083&measure=4x6
paquetexpress_label_request_function	20-01-2026 11:22:12:647 CST	info	Execution started at:  1768929732646
paquetexpress_label_request_function	20-01-2026 11:18:35:215 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233329524&measure=4x6
paquetexpress_label_request_function	20-01-2026 11:18:35:215 CST	info	trackingNumber 411233329524
paquetexpress_label_request_function	20-01-2026 11:18:35:215 CST	info	Execution started at:  1768929515215
paquetexpress_label_request_function	20-01-2026 11:18:10:439 CST	info	trackingNumber 111233329460
paquetexpress_label_request_function	20-01-2026 11:18:10:439 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233329460&measure=4x6
paquetexpress_label_request_function	20-01-2026 11:18:10:234 CST	info	Execution started at:  1768929490233
paquetexpress_label_request_function	20-01-2026 11:15:46:104 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233329167&measure=4x6
paquetexpress_label_request_function	20-01-2026 11:15:46:104 CST	info	Execution started at:  1768929346104
paquetexpress_label_request_function	20-01-2026 11:15:46:104 CST	info	trackingNumber 411233329167
paquetexpress_label_request_function	20-01-2026 11:13:57:448 CST	info	trackingNumber 111233328931
paquetexpress_label_request_function	20-01-2026 11:13:57:448 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233328931&measure=4x6
paquetexpress_label_request_function	20-01-2026 11:13:57:243 CST	info	Execution started at:  1768929237242
paquetexpress_label_request_function	20-01-2026 11:09:32:224 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233328387&measure=4x6
paquetexpress_label_request_function	20-01-2026 11:09:32:224 CST	info	trackingNumber 111233328387
paquetexpress_label_request_function	20-01-2026 11:09:31:949 CST	info	Execution started at:  1768928971949
paquetexpress_label_request_function	20-01-2026 11:04:21:837 CST	info	trackingNumber 411233327648
paquetexpress_label_request_function	20-01-2026 11:04:21:837 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233327648&measure=4x6
paquetexpress_label_request_function	20-01-2026 11:04:21:625 CST	info	Execution started at:  1768928661625
paquetexpress_label_request_function	20-01-2026 10:52:45:979 CST	info	Execution started at:  1768927965979
paquetexpress_label_request_function	20-01-2026 10:52:45:979 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233325989&measure=4x6
paquetexpress_label_request_function	20-01-2026 10:52:45:979 CST	info	trackingNumber 111233325989
paquetexpress_label_request_function	20-01-2026 10:51:33:519 CST	info	trackingNumber 411233325850
paquetexpress_label_request_function	20-01-2026 10:51:33:518 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233325850&measure=4x6
paquetexpress_label_request_function	20-01-2026 10:51:33:314 CST	info	Execution started at:  1768927893314
paquetexpress_label_request_function	20-01-2026 10:46:25:520 CST	info	trackingNumber 411233325123
paquetexpress_label_request_function	20-01-2026 10:46:25:520 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233325123&measure=4x6
paquetexpress_label_request_function	20-01-2026 10:46:25:318 CST	info	Execution started at:  1768927585317
paquetexpress_label_request_function	20-01-2026 10:38:58:213 CST	info	trackingNumber 111233324211
paquetexpress_label_request_function	20-01-2026 10:38:58:213 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233324211&measure=4x6
paquetexpress_label_request_function	20-01-2026 10:38:58:167 CST	info	trackingNumber 111233324212
paquetexpress_label_request_function	20-01-2026 10:38:58:167 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233324212&measure=4x6
paquetexpress_label_request_function	20-01-2026 10:38:57:972 CST	info	Execution started at:  1768927137972
paquetexpress_label_request_function	20-01-2026 10:38:57:969 CST	info	Execution started at:  1768927137968
paquetexpress_label_request_function	20-01-2026 09:09:47:245 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233315784&measure=4x6
paquetexpress_label_request_function	20-01-2026 09:09:47:245 CST	info	trackingNumber 211233315784
paquetexpress_label_request_function	20-01-2026 09:09:47:037 CST	info	Execution started at:  1768921787036
paquetexpress_label_request_function	20-01-2026 09:06:31:229 CST	info	trackingNumber 211233315629
paquetexpress_label_request_function	20-01-2026 09:06:31:229 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233315629&measure=4x6
paquetexpress_label_request_function	20-01-2026 09:06:31:022 CST	info	Execution started at:  1768921591022
paquetexpress_label_request_function	20-01-2026 09:02:09:039 CST	info	trackingNumber 211233315326
paquetexpress_label_request_function	20-01-2026 09:02:09:039 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233315326&measure=4x6
paquetexpress_label_request_function	20-01-2026 09:02:08:831 CST	info	Execution started at:  1768921328831
paquetexpress_label_request_function	20-01-2026 08:57:32:107 CST	info	trackingNumber 211233315003
paquetexpress_label_request_function	20-01-2026 08:57:32:106 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233315003&measure=4x6
paquetexpress_label_request_function	20-01-2026 08:57:31:911 CST	info	Execution started at:  1768921051911
paquetexpress_label_request_function	20-01-2026 08:54:37:730 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233314790&measure=4x6
paquetexpress_label_request_function	20-01-2026 08:54:37:730 CST	info	trackingNumber 211233314790
paquetexpress_label_request_function	20-01-2026 08:54:37:525 CST	info	Execution started at:  1768920877524
paquetexpress_label_request_function	20-01-2026 08:50:11:932 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233314409&measure=4x6
paquetexpress_label_request_function	20-01-2026 08:50:11:932 CST	info	trackingNumber 211233314409
paquetexpress_label_request_function	20-01-2026 08:50:11:725 CST	info	Execution started at:  1768920611724
paquetexpress_label_request_function	20-01-2026 08:42:33:322 CST	info	trackingNumber 211233314176
paquetexpress_label_request_function	20-01-2026 08:42:33:322 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233314176&measure=4x6
paquetexpress_label_request_function	20-01-2026 08:42:33:041 CST	info	Execution started at:  1768920153041
paquetexpress_label_request_function	19-01-2026 18:11:30:029 CST	info	trackingNumber 191233299629
paquetexpress_label_request_function	19-01-2026 18:11:30:028 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=191233299629&measure=4x6
paquetexpress_label_request_function	19-01-2026 18:11:29:821 CST	info	Execution started at:  1768867889821
paquetexpress_label_request_function	19-01-2026 12:44:48:099 CST	info	trackingNumber 411233250085
paquetexpress_label_request_function	19-01-2026 12:44:48:099 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233250085&measure=4x6
paquetexpress_label_request_function	19-01-2026 12:44:47:915 CST	info	Execution started at:  1768848287914
paquetexpress_label_request_function	19-01-2026 12:38:43:027 CST	info	trackingNumber 111233248902
paquetexpress_label_request_function	19-01-2026 12:38:43:027 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233248902&measure=4x6
paquetexpress_label_request_function	19-01-2026 12:38:42:848 CST	info	trackingNumber 111233248903
paquetexpress_label_request_function	19-01-2026 12:38:42:848 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233248903&measure=4x6
paquetexpress_label_request_function	19-01-2026 12:38:42:648 CST	info	Execution started at:  1768847922648
paquetexpress_label_request_function	19-01-2026 12:38:42:646 CST	info	Execution started at:  1768847922646
paquetexpress_label_request_function	19-01-2026 12:34:08:070 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233248254&measure=4x6
paquetexpress_label_request_function	19-01-2026 12:34:08:070 CST	info	trackingNumber 111233248254
paquetexpress_label_request_function	19-01-2026 12:34:07:879 CST	info	Execution started at:  1768847647878
paquetexpress_label_request_function	19-01-2026 12:31:04:334 CST	info	trackingNumber 111233247816
paquetexpress_label_request_function	19-01-2026 12:31:04:334 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233247816&measure=4x6
paquetexpress_label_request_function	19-01-2026 12:31:04:126 CST	info	Execution started at:  1768847464125
paquetexpress_label_request_function	19-01-2026 12:20:28:104 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233245868&measure=4x6
paquetexpress_label_request_function	19-01-2026 12:20:28:104 CST	info	trackingNumber 111233245868
paquetexpress_label_request_function	19-01-2026 12:20:27:917 CST	info	Execution started at:  1768846827916
paquetexpress_label_request_function	19-01-2026 12:15:03:717 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233244971&measure=4x6
paquetexpress_label_request_function	19-01-2026 12:15:03:717 CST	info	trackingNumber 111233244971
paquetexpress_label_request_function	19-01-2026 12:15:03:443 CST	info	Execution started at:  1768846503442
paquetexpress_label_request_function	19-01-2026 11:44:17:301 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233240768&measure=4x6
paquetexpress_label_request_function	19-01-2026 11:44:17:301 CST	info	trackingNumber 111233240768
paquetexpress_label_request_function	19-01-2026 11:44:17:168 CST	info	Execution started at:  1768844657167
paquetexpress_label_request_function	19-01-2026 11:39:00:145 CST	info	trackingNumber 111233239997
paquetexpress_label_request_function	19-01-2026 11:39:00:145 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233239997&measure=4x6
paquetexpress_label_request_function	19-01-2026 11:38:59:944 CST	info	Execution started at:  1768844339944
paquetexpress_label_request_function	19-01-2026 11:33:55:837 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233239199&measure=4x6
paquetexpress_label_request_function	19-01-2026 11:33:55:837 CST	info	trackingNumber 111233239199
paquetexpress_label_request_function	19-01-2026 11:33:55:631 CST	info	Execution started at:  1768844035631
paquetexpress_label_request_function	19-01-2026 11:29:28:982 CST	info	trackingNumber 411233238586
paquetexpress_label_request_function	19-01-2026 11:29:28:982 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233238586&measure=4x6
paquetexpress_label_request_function	19-01-2026 11:29:28:784 CST	info	Execution started at:  1768843768783
paquetexpress_label_request_function	19-01-2026 11:22:51:604 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233237812&measure=4x6
paquetexpress_label_request_function	19-01-2026 11:22:51:604 CST	info	trackingNumber 411233237812
paquetexpress_label_request_function	19-01-2026 11:22:51:402 CST	info	Execution started at:  1768843371401
paquetexpress_label_request_function	19-01-2026 09:56:26:402 CST	info	trackingNumber 111233228623
paquetexpress_label_request_function	19-01-2026 09:56:26:402 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233228623&measure=4x6
paquetexpress_label_request_function	19-01-2026 09:56:26:305 CST	info	trackingNumber 111233228622
paquetexpress_label_request_function	19-01-2026 09:56:26:305 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233228622&measure=4x6
paquetexpress_label_request_function	19-01-2026 09:56:26:116 CST	info	Execution started at:  1768838186116
paquetexpress_label_request_function	19-01-2026 09:56:26:113 CST	info	Execution started at:  1768838186113
paquetexpress_label_request_function	19-01-2026 09:41:28:699 CST	info	trackingNumber 211233227562
paquetexpress_label_request_function	19-01-2026 09:41:28:699 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233227562&measure=4x6
paquetexpress_label_request_function	19-01-2026 09:41:28:500 CST	info	Execution started at:  1768837288499
paquetexpress_label_request_function	19-01-2026 09:22:30:423 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233225706&measure=4x6
paquetexpress_label_request_function	19-01-2026 09:22:30:423 CST	info	trackingNumber 211233225706
paquetexpress_label_request_function	19-01-2026 09:22:30:233 CST	info	Execution started at:  1768836150232
paquetexpress_label_request_function	19-01-2026 09:18:58:555 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233225478&measure=4x6
paquetexpress_label_request_function	19-01-2026 09:18:58:555 CST	info	trackingNumber 211233225478
paquetexpress_label_request_function	19-01-2026 09:18:58:354 CST	info	Execution started at:  1768835938353
paquetexpress_label_request_function	19-01-2026 09:12:21:418 CST	info	trackingNumber 111233224956
paquetexpress_label_request_function	19-01-2026 09:12:21:418 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233224956&measure=4x6
paquetexpress_label_request_function	19-01-2026 09:12:21:151 CST	info	Execution started at:  1768835541151
paquetexpress_label_request_function	19-01-2026 09:05:31:332 CST	info	trackingNumber 111233224430
paquetexpress_label_request_function	19-01-2026 09:05:31:331 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233224430&measure=4x6
paquetexpress_label_request_function	19-01-2026 09:05:31:133 CST	info	Execution started at:  1768835131133
paquetexpress_label_request_function	19-01-2026 08:59:06:620 CST	info	trackingNumber 111233224158
paquetexpress_label_request_function	19-01-2026 08:59:06:620 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233224158&measure=4x6
paquetexpress_label_request_function	19-01-2026 08:59:06:346 CST	info	Execution started at:  1768834746345
paquetexpress_label_request_function	19-01-2026 08:54:30:222 CST	info	trackingNumber 111233223996
paquetexpress_label_request_function	19-01-2026 08:54:30:222 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233223996&measure=4x6
paquetexpress_label_request_function	19-01-2026 08:54:30:035 CST	info	Execution started at:  1768834470035
paquetexpress_label_request_function	19-01-2026 08:49:28:699 CST	info	trackingNumber 111233223831
paquetexpress_label_request_function	19-01-2026 08:49:28:699 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233223831&measure=4x6
paquetexpress_label_request_function	19-01-2026 08:49:28:507 CST	info	Execution started at:  1768834168507
paquetexpress_label_request_function	17-01-2026 10:11:14:791 CST	info	trackingNumber 211233177230
paquetexpress_label_request_function	17-01-2026 10:11:14:791 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233177230&measure=4x6
paquetexpress_label_request_function	17-01-2026 10:11:14:589 CST	info	Execution started at:  1768666274588
paquetexpress_label_request_function	17-01-2026 10:01:53:649 CST	info	trackingNumber 211233176505
paquetexpress_label_request_function	17-01-2026 10:01:53:649 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233176505&measure=4x6
paquetexpress_label_request_function	17-01-2026 10:01:53:445 CST	info	Execution started at:  1768665713445
paquetexpress_label_request_function	17-01-2026 09:55:38:740 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233176166&measure=4x6
paquetexpress_label_request_function	17-01-2026 09:55:38:740 CST	info	trackingNumber 211233176166
paquetexpress_label_request_function	17-01-2026 09:55:38:533 CST	info	Execution started at:  1768665338533
paquetexpress_label_request_function	17-01-2026 09:52:59:936 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233176016&measure=4x6
paquetexpress_label_request_function	17-01-2026 09:52:59:936 CST	info	trackingNumber 211233176016
paquetexpress_label_request_function	17-01-2026 09:52:59:732 CST	info	Execution started at:  1768665179731
paquetexpress_label_request_function	17-01-2026 09:49:35:446 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233175851&measure=4x6
paquetexpress_label_request_function	17-01-2026 09:49:35:446 CST	info	trackingNumber 211233175851
paquetexpress_label_request_function	17-01-2026 09:49:35:239 CST	info	Execution started at:  1768664975239
paquetexpress_label_request_function	16-01-2026 17:12:16:100 CST	info	trackingNumber 111233153094
paquetexpress_label_request_function	16-01-2026 17:12:16:099 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233153094&measure=4x6
paquetexpress_label_request_function	16-01-2026 17:12:15:908 CST	info	Execution started at:  1768605135908
paquetexpress_label_request_function	16-01-2026 15:01:58:528 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233134251&measure=4x6
paquetexpress_label_request_function	16-01-2026 15:01:58:528 CST	info	trackingNumber 411233134251
paquetexpress_label_request_function	16-01-2026 15:01:58:330 CST	info	Execution started at:  1768597318330
paquetexpress_label_request_function	16-01-2026 14:08:01:641 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233127409&measure=4x6
paquetexpress_label_request_function	16-01-2026 14:08:01:641 CST	info	trackingNumber 411233127409
paquetexpress_label_request_function	16-01-2026 14:08:01:440 CST	info	Execution started at:  1768594081439
paquetexpress_label_request_function	16-01-2026 13:04:57:837 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233107917&measure=4x6
paquetexpress_label_request_function	16-01-2026 13:04:57:837 CST	info	trackingNumber 111233107917
paquetexpress_label_request_function	16-01-2026 13:04:57:627 CST	info	Execution started at:  1768590297627
paquetexpress_label_request_function	16-01-2026 12:57:31:507 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233106714&measure=4x6
paquetexpress_label_request_function	16-01-2026 12:57:31:507 CST	info	trackingNumber 111233106714
paquetexpress_label_request_function	16-01-2026 12:57:31:305 CST	info	Execution started at:  1768589851305
paquetexpress_label_request_function	16-01-2026 12:40:31:626 CST	info	trackingNumber 411233103945
paquetexpress_label_request_function	16-01-2026 12:40:31:626 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233103945&measure=4x6
paquetexpress_label_request_function	16-01-2026 12:40:31:356 CST	info	Execution started at:  1768588831356
paquetexpress_label_request_function	16-01-2026 12:29:05:901 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233102094&measure=4x6
paquetexpress_label_request_function	16-01-2026 12:29:05:901 CST	info	trackingNumber 411233102094
paquetexpress_label_request_function	16-01-2026 12:29:05:711 CST	info	Execution started at:  1768588145711
paquetexpress_label_request_function	16-01-2026 12:08:07:838 CST	info	trackingNumber 411233099194
paquetexpress_label_request_function	16-01-2026 12:08:07:838 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233099194&measure=4x6
paquetexpress_label_request_function	16-01-2026 12:08:07:626 CST	info	Execution started at:  1768586887625
paquetexpress_label_request_function	16-01-2026 12:03:15:039 CST	info	trackingNumber 411233098562
paquetexpress_label_request_function	16-01-2026 12:03:15:039 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233098562&measure=4x6
paquetexpress_label_request_function	16-01-2026 12:03:14:835 CST	info	Execution started at:  1768586594835
paquetexpress_label_request_function	16-01-2026 11:32:58:147 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233094141&measure=4x6
paquetexpress_label_request_function	16-01-2026 11:32:58:147 CST	info	trackingNumber 211233094141
paquetexpress_label_request_function	16-01-2026 11:32:57:941 CST	info	Execution started at:  1768584777940
paquetexpress_label_request_function	16-01-2026 10:59:19:131 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233089498&measure=4x6
paquetexpress_label_request_function	16-01-2026 10:59:19:131 CST	info	trackingNumber 211233089498
paquetexpress_label_request_function	16-01-2026 10:59:18:919 CST	info	Execution started at:  1768582758919
paquetexpress_label_request_function	16-01-2026 10:41:04:034 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=191233087334&measure=4x6
paquetexpress_label_request_function	16-01-2026 10:41:04:034 CST	info	trackingNumber 191233087334
paquetexpress_label_request_function	16-01-2026 10:41:03:826 CST	info	Execution started at:  1768581663825
paquetexpress_label_request_function	16-01-2026 10:34:56:826 CST	info	trackingNumber 411233086751
paquetexpress_label_request_function	16-01-2026 10:34:56:826 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233086751&measure=4x6
paquetexpress_label_request_function	16-01-2026 10:34:56:554 CST	info	Execution started at:  1768581296554
paquetexpress_label_request_function	16-01-2026 10:31:28:767 CST	info	trackingNumber 411233086415
paquetexpress_label_request_function	16-01-2026 10:31:28:766 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233086415&measure=4x6
paquetexpress_label_request_function	16-01-2026 10:31:28:568 CST	info	Execution started at:  1768581088568
paquetexpress_label_request_function	16-01-2026 10:23:59:140 CST	info	trackingNumber 411233085735
paquetexpress_label_request_function	16-01-2026 10:23:59:140 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233085735&measure=4x6
paquetexpress_label_request_function	16-01-2026 10:23:58:936 CST	info	Execution started at:  1768580638936
paquetexpress_label_request_function	16-01-2026 09:12:40:339 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233079757&measure=4x6
paquetexpress_label_request_function	16-01-2026 09:12:40:339 CST	info	trackingNumber 111233079757
paquetexpress_label_request_function	16-01-2026 09:12:40:134 CST	info	Execution started at:  1768576360133
paquetexpress_label_request_function	16-01-2026 09:09:36:327 CST	info	trackingNumber 111233079613
paquetexpress_label_request_function	16-01-2026 09:09:36:327 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233079613&measure=4x6
paquetexpress_label_request_function	16-01-2026 09:09:36:059 CST	info	Execution started at:  1768576176058
paquetexpress_label_request_function	16-01-2026 09:06:12:846 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233079420&measure=4x6
paquetexpress_label_request_function	16-01-2026 09:06:12:846 CST	info	Execution started at:  1768575972846
paquetexpress_label_request_function	16-01-2026 09:06:12:846 CST	info	trackingNumber 211233079420
paquetexpress_label_request_function	16-01-2026 09:04:30:196 CST	info	trackingNumber 111233079338
paquetexpress_label_request_function	16-01-2026 09:04:30:195 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233079338&measure=4x6
paquetexpress_label_request_function	16-01-2026 09:04:29:997 CST	info	Execution started at:  1768575869997
paquetexpress_label_request_function	16-01-2026 09:00:23:741 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233079135&measure=4x6
paquetexpress_label_request_function	16-01-2026 09:00:23:741 CST	info	trackingNumber 111233079135
paquetexpress_label_request_function	16-01-2026 09:00:23:535 CST	info	Execution started at:  1768575623535
paquetexpress_label_request_function	16-01-2026 08:55:08:935 CST	info	trackingNumber 111233078933
paquetexpress_label_request_function	16-01-2026 08:55:08:935 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233078933&measure=4x6
paquetexpress_label_request_function	16-01-2026 08:55:08:727 CST	info	Execution started at:  1768575308726
paquetexpress_label_request_function	16-01-2026 08:50:09:322 CST	info	trackingNumber 111233078649
paquetexpress_label_request_function	16-01-2026 08:50:09:322 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111233078649&measure=4x6
paquetexpress_label_request_function	16-01-2026 08:50:09:120 CST	info	Execution started at:  1768575009119
paquetexpress_label_request_function	15-01-2026 15:34:37:128 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233038574&measure=4x6
paquetexpress_label_request_function	15-01-2026 15:34:37:128 CST	info	trackingNumber 211233038574
paquetexpress_label_request_function	15-01-2026 15:34:36:926 CST	info	Execution started at:  1768512876926
paquetexpress_label_request_function	15-01-2026 13:14:51:737 CST	info	trackingNumber 211233019524
paquetexpress_label_request_function	15-01-2026 13:14:51:737 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233019524&measure=4x6
paquetexpress_label_request_function	15-01-2026 13:14:51:527 CST	info	Execution started at:  1768504491526
paquetexpress_label_request_function	15-01-2026 13:10:13:226 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233018882&measure=4x6
paquetexpress_label_request_function	15-01-2026 13:10:13:226 CST	info	trackingNumber 411233018882
paquetexpress_label_request_function	15-01-2026 13:10:12:953 CST	info	Execution started at:  1768504212953
paquetexpress_label_request_function	15-01-2026 12:57:31:426 CST	info	trackingNumber 411233017029
paquetexpress_label_request_function	15-01-2026 12:57:31:426 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233017029&measure=4x6
paquetexpress_label_request_function	15-01-2026 12:57:31:220 CST	info	Execution started at:  1768503451219
paquetexpress_label_request_function	15-01-2026 12:52:30:695 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233016232&measure=4x6
paquetexpress_label_request_function	15-01-2026 12:52:30:695 CST	info	trackingNumber 411233016232
paquetexpress_label_request_function	15-01-2026 12:52:30:480 CST	info	Execution started at:  1768503150479
paquetexpress_label_request_function	15-01-2026 12:40:30:639 CST	info	trackingNumber 411233014034
paquetexpress_label_request_function	15-01-2026 12:40:30:639 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233014034&measure=4x6
paquetexpress_label_request_function	15-01-2026 12:40:30:433 CST	info	Execution started at:  1768502430432
paquetexpress_label_request_function	15-01-2026 12:25:20:991 CST	info	trackingNumber 411233011589
paquetexpress_label_request_function	15-01-2026 12:25:20:991 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233011589&measure=4x6
paquetexpress_label_request_function	15-01-2026 12:25:20:794 CST	info	Execution started at:  1768501520793
paquetexpress_label_request_function	15-01-2026 12:15:49:280 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233010027&measure=4x6
paquetexpress_label_request_function	15-01-2026 12:15:49:280 CST	info	trackingNumber 411233010027
paquetexpress_label_request_function	15-01-2026 12:15:49:091 CST	info	Execution started at:  1768500949090
paquetexpress_label_request_function	15-01-2026 12:06:03:029 CST	info	trackingNumber 411233008654
paquetexpress_label_request_function	15-01-2026 12:06:03:029 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233008654&measure=4x6
paquetexpress_label_request_function	15-01-2026 12:06:02:827 CST	info	Execution started at:  1768500362827
paquetexpress_label_request_function	15-01-2026 11:52:49:506 CST	info	trackingNumber 411233006865
paquetexpress_label_request_function	15-01-2026 11:52:49:506 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233006865&measure=4x6
paquetexpress_label_request_function	15-01-2026 11:52:49:372 CST	info	Execution started at:  1768499569372
paquetexpress_label_request_function	15-01-2026 11:41:32:230 CST	info	trackingNumber 411233005502
paquetexpress_label_request_function	15-01-2026 11:41:32:229 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411233005502&measure=4x6
paquetexpress_label_request_function	15-01-2026 11:41:32:031 CST	info	Execution started at:  1768498892031
paquetexpress_label_request_function	15-01-2026 11:33:02:645 CST	info	trackingNumber 191233004116
paquetexpress_label_request_function	15-01-2026 11:33:02:644 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=191233004116&measure=4x6
paquetexpress_label_request_function	15-01-2026 11:33:02:442 CST	info	Execution started at:  1768498382441
paquetexpress_label_request_function	15-01-2026 11:30:29:397 CST	info	trackingNumber 211233003830
paquetexpress_label_request_function	15-01-2026 11:30:29:397 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233003830&measure=4x6
paquetexpress_label_request_function	15-01-2026 11:30:29:195 CST	info	Execution started at:  1768498229194
paquetexpress_label_request_function	15-01-2026 11:22:45:951 CST	info	trackingNumber 211233001997
paquetexpress_label_request_function	15-01-2026 11:22:45:951 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233001997&measure=4x6
paquetexpress_label_request_function	15-01-2026 11:22:45:747 CST	info	Execution started at:  1768497765747
paquetexpress_label_request_function	15-01-2026 11:20:37:880 CST	info	trackingNumber 211233001760
paquetexpress_label_request_function	15-01-2026 11:20:37:880 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233001760&measure=4x6
paquetexpress_label_request_function	15-01-2026 11:20:37:686 CST	info	Execution started at:  1768497637686
paquetexpress_label_request_function	15-01-2026 11:10:45:041 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233000446&measure=4x6
paquetexpress_label_request_function	15-01-2026 11:10:45:041 CST	info	trackingNumber 211233000446
paquetexpress_label_request_function	15-01-2026 11:10:44:838 CST	info	Execution started at:  1768497044837
paquetexpress_label_request_function	15-01-2026 11:07:46:533 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211233000095&measure=4x6
paquetexpress_label_request_function	15-01-2026 11:07:46:533 CST	info	trackingNumber 211233000095
paquetexpress_label_request_function	15-01-2026 11:07:46:327 CST	info	Execution started at:  1768496866326
paquetexpress_label_request_function	15-01-2026 11:04:13:788 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232999614&measure=4x6
paquetexpress_label_request_function	15-01-2026 11:04:13:788 CST	info	trackingNumber 111232999614
paquetexpress_label_request_function	15-01-2026 11:04:13:595 CST	info	Execution started at:  1768496653594
paquetexpress_label_request_function	15-01-2026 10:56:27:939 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232998631&measure=4x6
paquetexpress_label_request_function	15-01-2026 10:56:27:939 CST	info	trackingNumber 111232998631
paquetexpress_label_request_function	15-01-2026 10:56:27:733 CST	info	Execution started at:  1768496187733
paquetexpress_label_request_function	15-01-2026 10:52:11:730 CST	info	trackingNumber 111232998141
paquetexpress_label_request_function	15-01-2026 10:52:11:730 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232998141&measure=4x6
paquetexpress_label_request_function	15-01-2026 10:52:11:525 CST	info	Execution started at:  1768495931524
paquetexpress_label_request_function	15-01-2026 10:43:44:797 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232997358&measure=4x6
paquetexpress_label_request_function	15-01-2026 10:43:44:797 CST	info	trackingNumber 111232997358
paquetexpress_label_request_function	15-01-2026 10:43:44:695 CST	info	trackingNumber 111232997357
paquetexpress_label_request_function	15-01-2026 10:43:44:694 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232997357&measure=4x6
paquetexpress_label_request_function	15-01-2026 10:43:44:492 CST	info	Execution started at:  1768495424492
paquetexpress_label_request_function	15-01-2026 10:43:44:489 CST	info	Execution started at:  1768495424488
paquetexpress_label_request_function	15-01-2026 10:30:11:831 CST	info	trackingNumber 111232995980
paquetexpress_label_request_function	15-01-2026 10:30:11:831 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232995980&measure=4x6
paquetexpress_label_request_function	15-01-2026 10:30:11:628 CST	info	Execution started at:  1768494611627
paquetexpress_label_request_function	15-01-2026 10:26:19:118 CST	info	trackingNumber 111232995558
paquetexpress_label_request_function	15-01-2026 10:26:19:118 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232995558&measure=4x6
paquetexpress_label_request_function	15-01-2026 10:26:18:848 CST	info	Execution started at:  1768494378847
paquetexpress_label_request_function	15-01-2026 10:11:19:231 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232994100&measure=4x6
paquetexpress_label_request_function	15-01-2026 10:11:19:231 CST	info	trackingNumber 111232994100
paquetexpress_label_request_function	15-01-2026 10:11:19:025 CST	info	Execution started at:  1768493479024
paquetexpress_label_request_function	15-01-2026 09:32:30:535 CST	info	trackingNumber 111232989654
paquetexpress_label_request_function	15-01-2026 09:32:30:535 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232989654&measure=4x6
paquetexpress_label_request_function	15-01-2026 09:32:30:334 CST	info	Execution started at:  1768491150333
paquetexpress_label_request_function	15-01-2026 09:26:20:926 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232989183&measure=4x6
paquetexpress_label_request_function	15-01-2026 09:26:20:926 CST	info	trackingNumber 111232989183
paquetexpress_label_request_function	15-01-2026 09:26:20:718 CST	info	Execution started at:  1768490780718
paquetexpress_label_request_function	15-01-2026 09:22:16:434 CST	info	trackingNumber 111232988918
paquetexpress_label_request_function	15-01-2026 09:22:16:434 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232988918&measure=4x6
paquetexpress_label_request_function	15-01-2026 09:22:16:225 CST	info	Execution started at:  1768490536225
paquetexpress_label_request_function	15-01-2026 09:19:32:931 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232988775&measure=4x6
paquetexpress_label_request_function	15-01-2026 09:19:32:931 CST	info	trackingNumber 111232988775
paquetexpress_label_request_function	15-01-2026 09:19:32:728 CST	info	Execution started at:  1768490372728
paquetexpress_label_request_function	15-01-2026 09:14:38:532 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232988470&measure=4x6
paquetexpress_label_request_function	15-01-2026 09:14:38:532 CST	info	trackingNumber 111232988470
paquetexpress_label_request_function	15-01-2026 09:14:38:325 CST	info	Execution started at:  1768490078324
paquetexpress_label_request_function	14-01-2026 14:05:18:724 CST	info	trackingNumber 411232933811
paquetexpress_label_request_function	14-01-2026 14:05:18:724 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232933811&measure=4x6
paquetexpress_label_request_function	14-01-2026 14:05:18:450 CST	info	Execution started at:  1768421118450
paquetexpress_label_request_function	14-01-2026 13:46:47:822 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232931365&measure=4x6
paquetexpress_label_request_function	14-01-2026 13:46:47:822 CST	info	trackingNumber 411232931365
paquetexpress_label_request_function	14-01-2026 13:46:47:620 CST	info	Execution started at:  1768420007620
paquetexpress_label_request_function	14-01-2026 13:00:51:534 CST	info	trackingNumber 411232924728
paquetexpress_label_request_function	14-01-2026 13:00:51:534 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232924728&measure=4x6
paquetexpress_label_request_function	14-01-2026 13:00:51:327 CST	info	Execution started at:  1768417251327
paquetexpress_label_request_function	14-01-2026 12:53:46:328 CST	info	trackingNumber 411232923609
paquetexpress_label_request_function	14-01-2026 12:53:46:328 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232923609&measure=4x6
paquetexpress_label_request_function	14-01-2026 12:53:46:119 CST	info	Execution started at:  1768416826119
paquetexpress_label_request_function	14-01-2026 12:51:28:548 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232923222&measure=4x6
paquetexpress_label_request_function	14-01-2026 12:51:28:548 CST	info	trackingNumber 111232923222
paquetexpress_label_request_function	14-01-2026 12:51:28:547 CST	info	Execution started at:  1768416688547
paquetexpress_label_request_function	14-01-2026 12:51:08:579 CST	info	trackingNumber 411232923166
paquetexpress_label_request_function	14-01-2026 12:51:08:579 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232923166&measure=4x6
paquetexpress_label_request_function	14-01-2026 12:51:08:384 CST	info	Execution started at:  1768416668384
paquetexpress_label_request_function	14-01-2026 12:46:47:298 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232922496&measure=4x6
paquetexpress_label_request_function	14-01-2026 12:46:47:298 CST	info	trackingNumber 111232922496
paquetexpress_label_request_function	14-01-2026 12:46:47:108 CST	info	Execution started at:  1768416407108
paquetexpress_label_request_function	14-01-2026 12:38:02:899 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232920932&measure=4x6
paquetexpress_label_request_function	14-01-2026 12:38:02:899 CST	info	trackingNumber 411232920932
paquetexpress_label_request_function	14-01-2026 12:38:02:698 CST	info	Execution started at:  1768415882698
paquetexpress_label_request_function	14-01-2026 12:22:09:523 CST	info	trackingNumber 411232918545
paquetexpress_label_request_function	14-01-2026 12:22:09:523 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232918545&measure=4x6
paquetexpress_label_request_function	14-01-2026 12:22:09:251 CST	info	Execution started at:  1768414929250
paquetexpress_label_request_function	14-01-2026 12:16:28:336 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232917571&measure=4x6
paquetexpress_label_request_function	14-01-2026 12:16:28:336 CST	info	trackingNumber 111232917571
paquetexpress_label_request_function	14-01-2026 12:16:28:135 CST	info	Execution started at:  1768414588135
paquetexpress_label_request_function	14-01-2026 12:11:04:545 CST	info	trackingNumber 111232916867
paquetexpress_label_request_function	14-01-2026 12:11:04:544 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232916867&measure=4x6
paquetexpress_label_request_function	14-01-2026 12:11:04:339 CST	info	Execution started at:  1768414264338
paquetexpress_label_request_function	14-01-2026 12:04:14:943 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232915882&measure=4x6
paquetexpress_label_request_function	14-01-2026 12:04:14:943 CST	info	Execution started at:  1768413854943
paquetexpress_label_request_function	14-01-2026 12:04:14:943 CST	info	trackingNumber 111232915882
paquetexpress_label_request_function	14-01-2026 12:02:50:198 CST	info	trackingNumber 411232915645
paquetexpress_label_request_function	14-01-2026 12:02:50:197 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232915645&measure=4x6
paquetexpress_label_request_function	14-01-2026 12:02:50:003 CST	info	Execution started at:  1768413770003
paquetexpress_label_request_function	14-01-2026 11:55:28:947 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232914636&measure=4x6
paquetexpress_label_request_function	14-01-2026 11:55:28:947 CST	info	trackingNumber 411232914636
paquetexpress_label_request_function	14-01-2026 11:55:28:748 CST	info	Execution started at:  1768413328748
paquetexpress_label_request_function	14-01-2026 11:46:55:020 CST	info	trackingNumber 111232913187
paquetexpress_label_request_function	14-01-2026 11:46:55:020 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232913187&measure=4x6
paquetexpress_label_request_function	14-01-2026 11:46:54:749 CST	info	Execution started at:  1768412814749
paquetexpress_label_request_function	14-01-2026 11:30:16:417 CST	info	trackingNumber 411232910444
paquetexpress_label_request_function	14-01-2026 11:30:16:417 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232910444&measure=4x6
paquetexpress_label_request_function	14-01-2026 11:30:16:152 CST	info	Execution started at:  1768411816152
paquetexpress_label_request_function	14-01-2026 11:13:56:852 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232908523&measure=4x6
paquetexpress_label_request_function	14-01-2026 11:13:56:852 CST	info	trackingNumber 111232908523
paquetexpress_label_request_function	14-01-2026 11:13:56:646 CST	info	Execution started at:  1768410836645
paquetexpress_label_request_function	14-01-2026 11:09:18:139 CST	info	trackingNumber 111232907991
paquetexpress_label_request_function	14-01-2026 11:09:18:138 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232907991&measure=4x6
paquetexpress_label_request_function	14-01-2026 11:09:17:932 CST	info	Execution started at:  1768410557932
paquetexpress_label_request_function	14-01-2026 10:57:00:019 CST	info	trackingNumber 111232906568
paquetexpress_label_request_function	14-01-2026 10:57:00:019 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232906568&measure=4x6
paquetexpress_label_request_function	14-01-2026 10:56:59:883 CST	info	Execution started at:  1768409819833
paquetexpress_label_request_function	14-01-2026 10:52:48:129 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232906021&measure=4x6
paquetexpress_label_request_function	14-01-2026 10:52:48:129 CST	info	trackingNumber 111232906021
paquetexpress_label_request_function	14-01-2026 10:52:47:929 CST	info	Execution started at:  1768409567928
paquetexpress_label_request_function	14-01-2026 10:44:19:021 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232904568&measure=4x6
paquetexpress_label_request_function	14-01-2026 10:44:19:021 CST	info	trackingNumber 211232904568
paquetexpress_label_request_function	14-01-2026 10:44:18:818 CST	info	Execution started at:  1768409058818
paquetexpress_label_request_function	14-01-2026 10:41:50:232 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232904307&measure=4x6
paquetexpress_label_request_function	14-01-2026 10:41:50:232 CST	info	trackingNumber 211232904307
paquetexpress_label_request_function	14-01-2026 10:41:50:026 CST	info	Execution started at:  1768408910025
paquetexpress_label_request_function	14-01-2026 10:29:31:835 CST	info	trackingNumber 111232902984
paquetexpress_label_request_function	14-01-2026 10:29:31:835 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232902984&measure=4x6
paquetexpress_label_request_function	14-01-2026 10:29:31:635 CST	info	Execution started at:  1768408171634
paquetexpress_label_request_function	14-01-2026 10:19:16:531 CST	info	trackingNumber 211232901924
paquetexpress_label_request_function	14-01-2026 10:19:16:531 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232901924&measure=4x6
paquetexpress_label_request_function	14-01-2026 10:19:16:325 CST	info	Execution started at:  1768407556324
paquetexpress_label_request_function	13-01-2026 14:54:50:326 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232845784&measure=4x6
paquetexpress_label_request_function	13-01-2026 14:54:50:326 CST	info	trackingNumber 111232845784
paquetexpress_label_request_function	13-01-2026 14:54:50:060 CST	info	Execution started at:  1768337690060
paquetexpress_label_request_function	13-01-2026 12:50:37:220 CST	info	trackingNumber 211232828084
paquetexpress_label_request_function	13-01-2026 12:50:37:220 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232828084&measure=4x6
paquetexpress_label_request_function	13-01-2026 12:50:36:949 CST	info	Execution started at:  1768330236949
paquetexpress_label_request_function	13-01-2026 11:47:48:185 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232813583&measure=4x6
paquetexpress_label_request_function	13-01-2026 11:47:48:185 CST	info	trackingNumber 111232813583
paquetexpress_label_request_function	13-01-2026 11:47:48:185 CST	info	Execution started at:  1768326468184
paquetexpress_label_request_function	13-01-2026 11:47:05:033 CST	info	trackingNumber 211232813487
paquetexpress_label_request_function	13-01-2026 11:47:05:032 CST	info	Execution started at:  1768326425032
paquetexpress_label_request_function	13-01-2026 11:47:05:032 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232813487&measure=4x6
paquetexpress_label_request_function	13-01-2026 11:45:30:486 CST	info	Execution started at:  1768326330486
paquetexpress_label_request_function	13-01-2026 11:45:30:486 CST	info	trackingNumber 111232813258
paquetexpress_label_request_function	13-01-2026 11:45:30:486 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232813258&measure=4x6
paquetexpress_label_request_function	13-01-2026 11:44:54:931 CST	info	trackingNumber 411232813153
paquetexpress_label_request_function	13-01-2026 11:44:54:930 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232813153&measure=4x6
paquetexpress_label_request_function	13-01-2026 11:44:54:725 CST	info	Execution started at:  1768326294725
paquetexpress_label_request_function	13-01-2026 11:42:30:654 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232812826&measure=4x6
paquetexpress_label_request_function	13-01-2026 11:42:30:654 CST	info	Execution started at:  1768326150654
paquetexpress_label_request_function	13-01-2026 11:42:30:654 CST	info	trackingNumber 411232812826
paquetexpress_label_request_function	13-01-2026 11:41:42:249 CST	info	trackingNumber 111232812701
paquetexpress_label_request_function	13-01-2026 11:41:42:249 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232812701&measure=4x6
paquetexpress_label_request_function	13-01-2026 11:41:42:045 CST	info	Execution started at:  1768326102044
paquetexpress_label_request_function	13-01-2026 11:36:14:094 CST	info	trackingNumber 211232812026
paquetexpress_label_request_function	13-01-2026 11:36:14:094 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232812026&measure=4x6
paquetexpress_label_request_function	13-01-2026 11:36:13:897 CST	info	Execution started at:  1768325773896
paquetexpress_label_request_function	13-01-2026 11:34:05:428 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232811674&measure=4x6
paquetexpress_label_request_function	13-01-2026 11:34:05:428 CST	info	trackingNumber 411232811674
paquetexpress_label_request_function	13-01-2026 11:34:05:427 CST	info	Execution started at:  1768325645427
paquetexpress_label_request_function	13-01-2026 11:32:44:967 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232811431&measure=4x6
paquetexpress_label_request_function	13-01-2026 11:32:44:967 CST	info	trackingNumber 211232811431
paquetexpress_label_request_function	13-01-2026 11:32:44:774 CST	info	Execution started at:  1768325564773
paquetexpress_label_request_function	13-01-2026 11:26:56:195 CST	info	trackingNumber 111232810569
paquetexpress_label_request_function	13-01-2026 11:26:56:195 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232810569&measure=4x6
paquetexpress_label_request_function	13-01-2026 11:26:56:195 CST	info	Execution started at:  1768325216195
paquetexpress_label_request_function	13-01-2026 11:25:22:465 CST	info	trackingNumber 211232810363
paquetexpress_label_request_function	13-01-2026 11:25:22:465 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232810363&measure=4x6
paquetexpress_label_request_function	13-01-2026 11:25:22:465 CST	info	Execution started at:  1768325122465
paquetexpress_label_request_function	13-01-2026 11:23:37:634 CST	info	trackingNumber 411232810168
paquetexpress_label_request_function	13-01-2026 11:23:37:634 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232810168&measure=4x6
paquetexpress_label_request_function	13-01-2026 11:23:37:430 CST	info	Execution started at:  1768325017430
paquetexpress_label_request_function	13-01-2026 11:17:52:728 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232809198&measure=4x6
paquetexpress_label_request_function	13-01-2026 11:17:52:728 CST	info	trackingNumber 111232809198
paquetexpress_label_request_function	13-01-2026 11:17:52:525 CST	info	Execution started at:  1768324672524
paquetexpress_label_request_function	13-01-2026 11:12:56:441 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232808208&measure=4x6
paquetexpress_label_request_function	13-01-2026 11:12:56:441 CST	info	trackingNumber 411232808208
paquetexpress_label_request_function	13-01-2026 11:12:56:240 CST	info	Execution started at:  1768324376240
paquetexpress_label_request_function	13-01-2026 10:58:08:741 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232805687&measure=4x6
paquetexpress_label_request_function	13-01-2026 10:58:08:741 CST	info	trackingNumber 111232805687
paquetexpress_label_request_function	13-01-2026 10:58:08:537 CST	info	Execution started at:  1768323488537
paquetexpress_label_request_function	13-01-2026 10:52:10:847 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232804847&measure=4x6
paquetexpress_label_request_function	13-01-2026 10:52:10:847 CST	info	trackingNumber 111232804847
paquetexpress_label_request_function	13-01-2026 10:52:10:639 CST	info	Execution started at:  1768323130639
paquetexpress_label_request_function	13-01-2026 10:45:23:743 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232803787&measure=4x6
paquetexpress_label_request_function	13-01-2026 10:45:23:743 CST	info	trackingNumber 111232803787
paquetexpress_label_request_function	13-01-2026 10:45:23:541 CST	info	Execution started at:  1768322723541
paquetexpress_label_request_function	13-01-2026 10:41:13:925 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232803340&measure=4x6
paquetexpress_label_request_function	13-01-2026 10:41:13:925 CST	info	trackingNumber 111232803340
paquetexpress_label_request_function	13-01-2026 10:41:13:649 CST	info	Execution started at:  1768322473649
paquetexpress_label_request_function	13-01-2026 10:29:22:192 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232802024&measure=4x6
paquetexpress_label_request_function	13-01-2026 10:29:22:192 CST	info	trackingNumber 111232802024
paquetexpress_label_request_function	13-01-2026 10:29:22:007 CST	info	Execution started at:  1768321762006
paquetexpress_label_request_function	13-01-2026 10:19:38:209 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232800978&measure=4x6
paquetexpress_label_request_function	13-01-2026 10:19:38:209 CST	info	trackingNumber 211232800978
paquetexpress_label_request_function	13-01-2026 10:19:38:005 CST	info	Execution started at:  1768321178004
paquetexpress_label_request_function	13-01-2026 10:12:14:648 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232800263&measure=4x6
paquetexpress_label_request_function	13-01-2026 10:12:14:648 CST	info	trackingNumber 411232800263
paquetexpress_label_request_function	13-01-2026 10:12:14:452 CST	info	Execution started at:  1768320734451
paquetexpress_label_request_function	13-01-2026 10:08:45:332 CST	info	trackingNumber 111232799941
paquetexpress_label_request_function	13-01-2026 10:08:45:332 CST	info	Execution started at:  1768320525332
paquetexpress_label_request_function	13-01-2026 10:08:45:332 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232799941&measure=4x6
paquetexpress_label_request_function	13-01-2026 10:08:42:623 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232799933&measure=4x6
paquetexpress_label_request_function	13-01-2026 10:08:42:623 CST	info	trackingNumber 411232799933
paquetexpress_label_request_function	13-01-2026 10:08:42:422 CST	info	Execution started at:  1768320522422
paquetexpress_label_request_function	13-01-2026 09:59:51:582 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232799179&measure=4x6
paquetexpress_label_request_function	13-01-2026 09:59:51:582 CST	info	trackingNumber 411232799179
paquetexpress_label_request_function	13-01-2026 09:59:51:581 CST	info	Execution started at:  1768319991581
paquetexpress_label_request_function	13-01-2026 09:59:43:294 CST	info	trackingNumber 111232799162
paquetexpress_label_request_function	13-01-2026 09:59:43:294 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232799162&measure=4x6
paquetexpress_label_request_function	13-01-2026 09:59:43:100 CST	info	Execution started at:  1768319983100
paquetexpress_label_request_function	13-01-2026 09:54:49:235 CST	info	trackingNumber 211232798690
paquetexpress_label_request_function	13-01-2026 09:54:49:235 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232798690&measure=4x6
paquetexpress_label_request_function	13-01-2026 09:54:49:033 CST	info	Execution started at:  1768319689033
paquetexpress_label_request_function	13-01-2026 09:48:24:737 CST	info	Execution started at:  1768319304737
paquetexpress_label_request_function	13-01-2026 09:48:24:737 CST	info	trackingNumber 211232798053
paquetexpress_label_request_function	13-01-2026 09:48:24:737 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232798053&measure=4x6
paquetexpress_label_request_function	13-01-2026 09:47:49:405 CST	info	trackingNumber 411232798005
paquetexpress_label_request_function	13-01-2026 09:47:49:404 CST	info	Execution started at:  1768319269404
paquetexpress_label_request_function	13-01-2026 09:47:49:404 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232798005&measure=4x6
paquetexpress_label_request_function	13-01-2026 09:45:52:295 CST	info	trackingNumber 211232797784
paquetexpress_label_request_function	13-01-2026 09:45:52:295 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232797784&measure=4x6
paquetexpress_label_request_function	13-01-2026 09:45:52:295 CST	info	Execution started at:  1768319152295
paquetexpress_label_request_function	13-01-2026 09:45:23:936 CST	info	trackingNumber 411232797719
paquetexpress_label_request_function	13-01-2026 09:45:23:935 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232797719&measure=4x6
paquetexpress_label_request_function	13-01-2026 09:45:23:734 CST	info	Execution started at:  1768319123734
paquetexpress_label_request_function	13-01-2026 09:42:06:334 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232797447&measure=4x6
paquetexpress_label_request_function	13-01-2026 09:42:06:334 CST	info	trackingNumber 411232797447
paquetexpress_label_request_function	13-01-2026 09:42:06:144 CST	info	Execution started at:  1768318926143
paquetexpress_label_request_function	13-01-2026 09:39:29:028 CST	info	trackingNumber 411232797258
paquetexpress_label_request_function	13-01-2026 09:39:29:028 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232797258&measure=4x6
paquetexpress_label_request_function	13-01-2026 09:39:28:827 CST	info	Execution started at:  1768318768827
paquetexpress_label_request_function	12-01-2026 18:02:32:017 CST	info	trackingNumber 191232774998
paquetexpress_label_request_function	12-01-2026 18:02:32:016 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=191232774998&measure=4x6
paquetexpress_label_request_function	12-01-2026 18:02:31:818 CST	info	Execution started at:  1768262551817
paquetexpress_label_request_function	12-01-2026 17:35:07:737 CST	info	trackingNumber 191232770681
paquetexpress_label_request_function	12-01-2026 17:35:07:736 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=191232770681&measure=4x6
paquetexpress_label_request_function	12-01-2026 17:35:07:530 CST	info	Execution started at:  1768260907529
paquetexpress_label_request_function	12-01-2026 17:00:26:929 CST	info	trackingNumber 191232764627
paquetexpress_label_request_function	12-01-2026 17:00:26:929 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=191232764627&measure=4x6
paquetexpress_label_request_function	12-01-2026 17:00:26:724 CST	info	Execution started at:  1768258826724
paquetexpress_label_request_function	12-01-2026 16:54:35:177 CST	info	trackingNumber 191232763534
paquetexpress_label_request_function	12-01-2026 16:54:35:177 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=191232763534&measure=4x6
paquetexpress_label_request_function	12-01-2026 16:54:34:992 CST	info	Execution started at:  1768258474991
paquetexpress_label_request_function	12-01-2026 16:12:19:224 CST	info	trackingNumber 191232755208
paquetexpress_label_request_function	12-01-2026 16:12:19:224 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=191232755208&measure=4x6
paquetexpress_label_request_function	12-01-2026 16:12:19:017 CST	info	Execution started at:  1768255938950
paquetexpress_label_request_function	12-01-2026 15:43:28:320 CST	info	trackingNumber 411232750758
paquetexpress_label_request_function	12-01-2026 15:43:28:320 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232750758&measure=4x6
paquetexpress_label_request_function	12-01-2026 15:43:28:050 CST	info	Execution started at:  1768254208050
paquetexpress_label_request_function	12-01-2026 14:27:46:337 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232739790&measure=4x6
paquetexpress_label_request_function	12-01-2026 14:27:46:337 CST	info	trackingNumber 411232739790
paquetexpress_label_request_function	12-01-2026 14:27:46:134 CST	info	Execution started at:  1768249666133
paquetexpress_label_request_function	12-01-2026 12:36:13:644 CST	info	trackingNumber 411232722467
paquetexpress_label_request_function	12-01-2026 12:36:13:644 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232722467&measure=4x6
paquetexpress_label_request_function	12-01-2026 12:36:13:430 CST	info	Execution started at:  1768242973430
paquetexpress_label_request_function	12-01-2026 12:19:37:589 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232719929&measure=4x6
paquetexpress_label_request_function	12-01-2026 12:19:37:589 CST	info	trackingNumber 411232719929
paquetexpress_label_request_function	12-01-2026 12:19:37:396 CST	info	Execution started at:  1768241977395
paquetexpress_label_request_function	12-01-2026 12:11:33:834 CST	info	trackingNumber 411232718466
paquetexpress_label_request_function	12-01-2026 12:11:33:833 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232718466&measure=4x6
paquetexpress_label_request_function	12-01-2026 12:11:33:625 CST	info	Execution started at:  1768241493624
paquetexpress_label_request_function	12-01-2026 12:02:35:845 CST	info	trackingNumber 411232717089
paquetexpress_label_request_function	12-01-2026 12:02:35:845 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232717089&measure=4x6
paquetexpress_label_request_function	12-01-2026 12:02:35:633 CST	info	Execution started at:  1768240955632
paquetexpress_label_request_function	12-01-2026 11:42:46:926 CST	info	trackingNumber 111232714625
paquetexpress_label_request_function	12-01-2026 11:42:46:926 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232714625&measure=4x6
paquetexpress_label_request_function	12-01-2026 11:42:46:726 CST	info	Execution started at:  1768239766725
paquetexpress_label_request_function	12-01-2026 11:38:44:744 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232714050&measure=4x6
paquetexpress_label_request_function	12-01-2026 11:38:44:744 CST	info	trackingNumber 111232714050
paquetexpress_label_request_function	12-01-2026 11:38:44:538 CST	info	Execution started at:  1768239524538
paquetexpress_label_request_function	12-01-2026 11:29:07:424 CST	info	trackingNumber 111232712583
paquetexpress_label_request_function	12-01-2026 11:29:07:424 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232712583&measure=4x6
paquetexpress_label_request_function	12-01-2026 11:29:07:221 CST	info	Execution started at:  1768238947220
paquetexpress_label_request_function	12-01-2026 11:25:23:469 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232712019&measure=4x6
paquetexpress_label_request_function	12-01-2026 11:25:23:469 CST	info	trackingNumber 111232712019
paquetexpress_label_request_function	12-01-2026 11:25:23:281 CST	info	Execution started at:  1768238723280
paquetexpress_label_request_function	12-01-2026 11:21:51:522 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232711512&measure=4x6
paquetexpress_label_request_function	12-01-2026 11:21:51:522 CST	info	trackingNumber 111232711512
paquetexpress_label_request_function	12-01-2026 11:21:51:319 CST	info	Execution started at:  1768238511319
paquetexpress_label_request_function	12-01-2026 11:16:35:388 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232710885&measure=4x6
paquetexpress_label_request_function	12-01-2026 11:16:35:388 CST	info	trackingNumber 111232710885
paquetexpress_label_request_function	12-01-2026 11:16:35:200 CST	info	Execution started at:  1768238195199
paquetexpress_label_request_function	12-01-2026 10:33:46:500 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232706059&measure=4x6
paquetexpress_label_request_function	12-01-2026 10:33:46:500 CST	info	trackingNumber 411232706059
paquetexpress_label_request_function	12-01-2026 10:33:46:309 CST	info	Execution started at:  1768235626309
paquetexpress_label_request_function	12-01-2026 10:09:28:036 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232702667&measure=4x6
paquetexpress_label_request_function	12-01-2026 10:09:28:036 CST	info	trackingNumber 111232702667
paquetexpress_label_request_function	12-01-2026 10:09:27:828 CST	info	Execution started at:  1768234167828
paquetexpress_label_request_function	12-01-2026 10:01:29:246 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232701939&measure=4x6
paquetexpress_label_request_function	12-01-2026 10:01:29:246 CST	info	Execution started at:  1768233689246
paquetexpress_label_request_function	12-01-2026 10:01:29:246 CST	info	trackingNumber 111232701939
paquetexpress_label_request_function	12-01-2026 10:00:53:893 CST	info	trackingNumber 411232701867
paquetexpress_label_request_function	12-01-2026 10:00:53:893 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232701867&measure=4x6
paquetexpress_label_request_function	12-01-2026 10:00:53:692 CST	info	Execution started at:  1768233653691
paquetexpress_label_request_function	12-01-2026 09:55:42:929 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232701377&measure=4x6
paquetexpress_label_request_function	12-01-2026 09:55:42:929 CST	info	trackingNumber 411232701377
paquetexpress_label_request_function	12-01-2026 09:55:42:720 CST	info	Execution started at:  1768233342720
paquetexpress_label_request_function	12-01-2026 09:49:24:330 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232700782&measure=4x6
paquetexpress_label_request_function	12-01-2026 09:49:24:330 CST	info	Execution started at:  1768232964330
paquetexpress_label_request_function	12-01-2026 09:49:24:330 CST	info	trackingNumber 111232700782
paquetexpress_label_request_function	12-01-2026 09:48:51:425 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=191232700703&measure=4x6
paquetexpress_label_request_function	12-01-2026 09:48:51:425 CST	info	trackingNumber 191232700703
paquetexpress_label_request_function	12-01-2026 09:48:51:153 CST	info	Execution started at:  1768232931152
paquetexpress_label_request_function	12-01-2026 09:44:57:371 CST	info	trackingNumber 111232700349
paquetexpress_label_request_function	12-01-2026 09:44:57:370 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232700349&measure=4x6
paquetexpress_label_request_function	12-01-2026 09:44:57:181 CST	info	Execution started at:  1768232697180
paquetexpress_label_request_function	12-01-2026 09:09:38:445 CST	info	trackingNumber 111232697414
paquetexpress_label_request_function	12-01-2026 09:09:38:444 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232697414&measure=4x6
paquetexpress_label_request_function	12-01-2026 09:09:38:243 CST	info	Execution started at:  1768230578242
paquetexpress_label_request_function	12-01-2026 08:54:13:344 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232696488&measure=4x6
paquetexpress_label_request_function	12-01-2026 08:54:13:344 CST	info	trackingNumber 111232696488
paquetexpress_label_request_function	12-01-2026 08:54:13:147 CST	info	Execution started at:  1768229653146
paquetexpress_label_request_function	12-01-2026 08:37:46:824 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232695932&measure=4x6
paquetexpress_label_request_function	12-01-2026 08:37:46:824 CST	info	trackingNumber 411232695932
paquetexpress_label_request_function	12-01-2026 08:37:46:552 CST	info	Execution started at:  1768228666552
paquetexpress_label_request_function	10-01-2026 10:35:01:219 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232651254&measure=4x6
paquetexpress_label_request_function	10-01-2026 10:35:01:219 CST	info	trackingNumber 211232651254
paquetexpress_label_request_function	10-01-2026 10:35:00:945 CST	info	Execution started at:  1768062900945
paquetexpress_label_request_function	10-01-2026 10:11:25:933 CST	info	trackingNumber 211232649596
paquetexpress_label_request_function	10-01-2026 10:11:25:933 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232649596&measure=4x6
paquetexpress_label_request_function	10-01-2026 10:11:25:726 CST	info	Execution started at:  1768061485725
paquetexpress_label_request_function	10-01-2026 10:07:39:049 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232649380&measure=4x6
paquetexpress_label_request_function	10-01-2026 10:07:39:049 CST	info	trackingNumber 211232649380
paquetexpress_label_request_function	10-01-2026 10:07:38:847 CST	info	Execution started at:  1768061258847
paquetexpress_label_request_function	10-01-2026 09:53:35:338 CST	info	trackingNumber 211232648343
paquetexpress_label_request_function	10-01-2026 09:53:35:338 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232648343&measure=4x6
paquetexpress_label_request_function	10-01-2026 09:53:35:131 CST	info	Execution started at:  1768060415131
paquetexpress_label_request_function	10-01-2026 09:43:08:004 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232647831&measure=4x6
paquetexpress_label_request_function	10-01-2026 09:43:08:004 CST	info	trackingNumber 211232647831
paquetexpress_label_request_function	10-01-2026 09:43:07:803 CST	info	Execution started at:  1768059787802
paquetexpress_label_request_function	10-01-2026 09:39:05:791 CST	info	trackingNumber 211232647594
paquetexpress_label_request_function	10-01-2026 09:39:05:791 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232647594&measure=4x6
paquetexpress_label_request_function	10-01-2026 09:39:05:598 CST	info	Execution started at:  1768059545597
paquetexpress_label_request_function	10-01-2026 09:33:09:024 CST	info	trackingNumber 111232647353
paquetexpress_label_request_function	10-01-2026 09:33:09:023 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232647353&measure=4x6
paquetexpress_label_request_function	10-01-2026 09:33:08:888 CST	info	Execution started at:  1768059188887
paquetexpress_label_request_function	10-01-2026 09:30:43:139 CST	info	Execution started at:  1768059043139
paquetexpress_label_request_function	10-01-2026 09:30:43:139 CST	info	trackingNumber 111232647244
paquetexpress_label_request_function	10-01-2026 09:30:43:139 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232647244&measure=4x6
paquetexpress_label_request_function	10-01-2026 09:29:58:947 CST	info	trackingNumber 211232647206
paquetexpress_label_request_function	10-01-2026 09:29:58:947 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232647206&measure=4x6
paquetexpress_label_request_function	10-01-2026 09:29:58:740 CST	info	Execution started at:  1768058998740
paquetexpress_label_request_function	10-01-2026 09:22:02:735 CST	info	trackingNumber 211232646778
paquetexpress_label_request_function	10-01-2026 09:22:02:735 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232646778&measure=4x6
paquetexpress_label_request_function	10-01-2026 09:22:02:524 CST	info	Execution started at:  1768058522457
paquetexpress_label_request_function	10-01-2026 09:19:13:031 CST	info	trackingNumber 211232646587
paquetexpress_label_request_function	10-01-2026 09:19:13:031 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232646587&measure=4x6
paquetexpress_label_request_function	10-01-2026 09:19:12:825 CST	info	Execution started at:  1768058352824
paquetexpress_label_request_function	10-01-2026 09:04:08:417 CST	info	trackingNumber 211232646028
paquetexpress_label_request_function	10-01-2026 09:04:08:417 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232646028&measure=4x6
paquetexpress_label_request_function	10-01-2026 09:04:08:150 CST	info	Execution started at:  1768057448149
paquetexpress_label_request_function	10-01-2026 08:51:41:027 CST	info	trackingNumber 211232645479
paquetexpress_label_request_function	10-01-2026 08:51:41:027 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232645479&measure=4x6
paquetexpress_label_request_function	10-01-2026 08:51:40:896 CST	info	Execution started at:  1768056700895
paquetexpress_label_request_function	09-01-2026 22:49:01:822 CST	info	trackingNumber 411232641104
paquetexpress_label_request_function	09-01-2026 22:49:01:821 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232641104&measure=4x6
paquetexpress_label_request_function	09-01-2026 22:49:01:617 CST	info	Execution started at:  1768020541550
paquetexpress_label_request_function	09-01-2026 22:10:03:626 CST	info	trackingNumber 411232640476
paquetexpress_label_request_function	09-01-2026 22:10:03:626 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232640476&measure=4x6
paquetexpress_label_request_function	09-01-2026 22:10:03:355 CST	info	Execution started at:  1768018203354
paquetexpress_label_request_function	09-01-2026 21:50:57:740 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232640189&measure=4x6
paquetexpress_label_request_function	09-01-2026 21:50:57:740 CST	info	trackingNumber 411232640189
paquetexpress_label_request_function	09-01-2026 21:50:57:538 CST	info	Execution started at:  1768017057537
paquetexpress_label_request_function	09-01-2026 21:47:34:140 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232640099&measure=4x6
paquetexpress_label_request_function	09-01-2026 21:47:34:140 CST	info	trackingNumber 411232640099
paquetexpress_label_request_function	09-01-2026 21:47:34:034 CST	info	trackingNumber 411232640098
paquetexpress_label_request_function	09-01-2026 21:47:34:034 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232640098&measure=4x6
paquetexpress_label_request_function	09-01-2026 21:47:33:832 CST	info	Execution started at:  1768016853832
paquetexpress_label_request_function	09-01-2026 21:47:33:830 CST	info	Execution started at:  1768016853830
paquetexpress_label_request_function	09-01-2026 12:50:55:542 CST	info	trackingNumber 111232579269
paquetexpress_label_request_function	09-01-2026 12:50:55:542 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232579269&measure=4x6
paquetexpress_label_request_function	09-01-2026 12:50:55:334 CST	info	Execution started at:  1767984655334
paquetexpress_label_request_function	09-01-2026 12:47:06:743 CST	info	trackingNumber 111232578533
paquetexpress_label_request_function	09-01-2026 12:47:06:742 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232578533&measure=4x6
paquetexpress_label_request_function	09-01-2026 12:47:06:539 CST	info	Execution started at:  1767984426539
paquetexpress_label_request_function	09-01-2026 12:43:01:729 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232577824&measure=4x6
paquetexpress_label_request_function	09-01-2026 12:43:01:729 CST	info	trackingNumber 111232577824
paquetexpress_label_request_function	09-01-2026 12:43:01:519 CST	info	Execution started at:  1767984181518
paquetexpress_label_request_function	09-01-2026 12:04:40:728 CST	info	trackingNumber 111232572023
paquetexpress_label_request_function	09-01-2026 12:04:40:728 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232572023&measure=4x6
paquetexpress_label_request_function	09-01-2026 12:04:40:520 CST	info	Execution started at:  1767981880520
paquetexpress_label_request_function	09-01-2026 12:01:43:854 CST	info	trackingNumber 111232571660
paquetexpress_label_request_function	09-01-2026 12:01:43:853 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232571660&measure=4x6
paquetexpress_label_request_function	09-01-2026 12:01:43:601 CST	info	Execution started at:  1767981703600
paquetexpress_label_request_function	09-01-2026 11:47:57:183 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232569641&measure=4x6
paquetexpress_label_request_function	09-01-2026 11:47:57:183 CST	info	trackingNumber 111232569641
paquetexpress_label_request_function	09-01-2026 11:47:56:990 CST	info	Execution started at:  1767980876990
paquetexpress_label_request_function	09-01-2026 11:41:00:123 CST	info	trackingNumber 111232568646
paquetexpress_label_request_function	09-01-2026 11:41:00:123 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232568646&measure=4x6
paquetexpress_label_request_function	09-01-2026 11:40:59:918 CST	info	Execution started at:  1767980459918
paquetexpress_label_request_function	09-01-2026 11:38:07:328 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232568159&measure=4x6
paquetexpress_label_request_function	09-01-2026 11:38:07:328 CST	info	trackingNumber 111232568159
paquetexpress_label_request_function	09-01-2026 11:38:07:122 CST	info	Execution started at:  1767980287122
paquetexpress_label_request_function	09-01-2026 11:22:38:037 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232565967&measure=4x6
paquetexpress_label_request_function	09-01-2026 11:22:38:037 CST	info	trackingNumber 411232565967
paquetexpress_label_request_function	09-01-2026 11:22:37:830 CST	info	Execution started at:  1767979357830
paquetexpress_label_request_function	09-01-2026 11:05:12:345 CST	info	trackingNumber 211232563277
paquetexpress_label_request_function	09-01-2026 11:05:12:345 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232563277&measure=4x6
paquetexpress_label_request_function	09-01-2026 11:05:12:135 CST	info	Execution started at:  1767978312134
paquetexpress_label_request_function	09-01-2026 10:52:05:522 CST	info	trackingNumber 111232561776
paquetexpress_label_request_function	09-01-2026 10:52:05:522 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232561776&measure=4x6
paquetexpress_label_request_function	09-01-2026 10:52:05:319 CST	info	Execution started at:  1767977525318
paquetexpress_label_request_function	09-01-2026 10:49:02:831 CST	info	trackingNumber 211232561389
paquetexpress_label_request_function	09-01-2026 10:49:02:831 CST	info	Execution started at:  1767977342831
paquetexpress_label_request_function	09-01-2026 10:49:02:831 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232561389&measure=4x6
paquetexpress_label_request_function	09-01-2026 10:47:19:995 CST	info	trackingNumber 111232561210
paquetexpress_label_request_function	09-01-2026 10:47:19:995 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232561210&measure=4x6
paquetexpress_label_request_function	09-01-2026 10:47:19:812 CST	info	Execution started at:  1767977239812
paquetexpress_label_request_function	09-01-2026 10:44:53:024 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232560970&measure=4x6
paquetexpress_label_request_function	09-01-2026 10:44:53:024 CST	info	trackingNumber 211232560970
paquetexpress_label_request_function	09-01-2026 10:44:52:822 CST	info	Execution started at:  1767977092822
paquetexpress_label_request_function	09-01-2026 10:42:32:275 CST	info	Execution started at:  1767976952275
paquetexpress_label_request_function	09-01-2026 10:42:32:275 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=191232560755&measure=4x6
paquetexpress_label_request_function	09-01-2026 10:42:32:275 CST	info	trackingNumber 191232560755
paquetexpress_label_request_function	09-01-2026 10:41:12:275 CST	info	trackingNumber 211232560606
paquetexpress_label_request_function	09-01-2026 10:41:12:275 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232560606&measure=4x6
paquetexpress_label_request_function	09-01-2026 10:41:12:274 CST	info	Execution started at:  1767976872274
paquetexpress_label_request_function	09-01-2026 10:40:35:866 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232560512&measure=4x6
paquetexpress_label_request_function	09-01-2026 10:40:35:866 CST	info	trackingNumber 111232560512
paquetexpress_label_request_function	09-01-2026 10:40:35:680 CST	info	Execution started at:  1767976835679
paquetexpress_label_request_function	09-01-2026 10:35:47:785 CST	info	trackingNumber 111232559784
paquetexpress_label_request_function	09-01-2026 10:35:47:785 CST	info	Execution started at:  1767976547785
paquetexpress_label_request_function	09-01-2026 10:35:47:785 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232559784&measure=4x6
paquetexpress_label_request_function	09-01-2026 10:35:37:959 CST	info	trackingNumber 411232559748
paquetexpress_label_request_function	09-01-2026 10:35:37:959 CST	info	Execution started at:  1767976537959
paquetexpress_label_request_function	09-01-2026 10:35:37:959 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232559748&measure=4x6
paquetexpress_label_request_function	09-01-2026 10:34:42:129 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232559613&measure=4x6
paquetexpress_label_request_function	09-01-2026 10:34:42:129 CST	info	trackingNumber 211232559613
paquetexpress_label_request_function	09-01-2026 10:34:41:921 CST	info	Execution started at:  1767976481920
paquetexpress_label_request_function	09-01-2026 10:30:03:881 CST	info	trackingNumber 411232558994
paquetexpress_label_request_function	09-01-2026 10:30:03:881 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232558994&measure=4x6
paquetexpress_label_request_function	09-01-2026 10:30:03:880 CST	info	Execution started at:  1767976203880
paquetexpress_label_request_function	09-01-2026 10:28:14:435 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232558875&measure=4x6
paquetexpress_label_request_function	09-01-2026 10:28:14:435 CST	info	trackingNumber 211232558875
paquetexpress_label_request_function	09-01-2026 10:28:14:230 CST	info	Execution started at:  1767976094229
paquetexpress_label_request_function	09-01-2026 10:23:29:725 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=191232558240&measure=4x6
paquetexpress_label_request_function	09-01-2026 10:23:29:725 CST	info	trackingNumber 191232558240
paquetexpress_label_request_function	09-01-2026 10:23:29:522 CST	info	Execution started at:  1767975809522
paquetexpress_label_request_function	09-01-2026 10:14:24:622 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232557007&measure=4x6
paquetexpress_label_request_function	09-01-2026 10:14:24:622 CST	info	trackingNumber 411232557007
paquetexpress_label_request_function	09-01-2026 10:14:24:418 CST	info	Execution started at:  1767975264417
paquetexpress_label_request_function	09-01-2026 10:08:52:031 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232555701&measure=4x6
paquetexpress_label_request_function	09-01-2026 10:08:52:031 CST	info	trackingNumber 411232555701
paquetexpress_label_request_function	09-01-2026 10:08:51:826 CST	info	Execution started at:  1767974931825
paquetexpress_label_request_function	09-01-2026 09:58:50:301 CST	info	trackingNumber 411232554693
paquetexpress_label_request_function	09-01-2026 09:58:50:301 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232554693&measure=4x6
paquetexpress_label_request_function	09-01-2026 09:58:50:111 CST	info	Execution started at:  1767974330110
paquetexpress_label_request_function	09-01-2026 09:48:57:723 CST	info	trackingNumber 211232553773
paquetexpress_label_request_function	09-01-2026 09:48:57:723 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232553773&measure=4x6
paquetexpress_label_request_function	09-01-2026 09:48:57:521 CST	info	Execution started at:  1767973737521
paquetexpress_label_request_function	09-01-2026 09:33:02:937 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232552500&measure=4x6
paquetexpress_label_request_function	09-01-2026 09:33:02:937 CST	info	trackingNumber 211232552500
paquetexpress_label_request_function	09-01-2026 09:33:02:732 CST	info	Execution started at:  1767972782732
paquetexpress_label_request_function	09-01-2026 09:30:58:837 CST	info	trackingNumber 111232552360
paquetexpress_label_request_function	09-01-2026 09:30:58:837 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232552360&measure=4x6
paquetexpress_label_request_function	09-01-2026 09:30:58:630 CST	info	Execution started at:  1767972658630
paquetexpress_label_request_function	09-01-2026 09:26:51:018 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232552009&measure=4x6
paquetexpress_label_request_function	09-01-2026 09:26:51:018 CST	info	Execution started at:  1767972411017
paquetexpress_label_request_function	09-01-2026 09:26:51:018 CST	info	trackingNumber 211232552009
paquetexpress_label_request_function	09-01-2026 09:26:34:184 CST	info	trackingNumber 111232551987
paquetexpress_label_request_function	09-01-2026 09:26:34:184 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232551987&measure=4x6
paquetexpress_label_request_function	09-01-2026 09:26:33:998 CST	info	Execution started at:  1767972393998
paquetexpress_label_request_function	09-01-2026 09:20:44:033 CST	info	trackingNumber 211232551508
paquetexpress_label_request_function	09-01-2026 09:20:44:033 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232551508&measure=4x6
paquetexpress_label_request_function	09-01-2026 09:20:43:832 CST	info	Execution started at:  1767972043831
paquetexpress_label_request_function	09-01-2026 09:18:15:258 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232551333&measure=4x6
paquetexpress_label_request_function	09-01-2026 09:18:15:258 CST	info	trackingNumber 211232551333
paquetexpress_label_request_function	09-01-2026 09:18:15:073 CST	info	Execution started at:  1767971895073
paquetexpress_label_request_function	09-01-2026 09:14:21:632 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232551024&measure=4x6
paquetexpress_label_request_function	09-01-2026 09:14:21:632 CST	info	trackingNumber 211232551024
paquetexpress_label_request_function	09-01-2026 09:14:21:423 CST	info	Execution started at:  1767971661422
paquetexpress_label_request_function	09-01-2026 09:05:44:422 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232550392&measure=4x6
paquetexpress_label_request_function	09-01-2026 09:05:44:422 CST	info	trackingNumber 211232550392
paquetexpress_label_request_function	09-01-2026 09:05:44:219 CST	info	Execution started at:  1767971144218
paquetexpress_label_request_function	09-01-2026 09:00:15:129 CST	info	trackingNumber 211232550120
paquetexpress_label_request_function	09-01-2026 09:00:15:128 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232550120&measure=4x6
paquetexpress_label_request_function	09-01-2026 09:00:14:853 CST	info	Execution started at:  1767970814853
paquetexpress_label_request_function	08-01-2026 14:22:23:334 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232497501&measure=4x6
paquetexpress_label_request_function	08-01-2026 14:22:23:334 CST	info	trackingNumber 111232497501
paquetexpress_label_request_function	08-01-2026 14:22:23:129 CST	info	Execution started at:  1767903743129
paquetexpress_label_request_function	08-01-2026 12:55:44:599 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232482498&measure=4x6
paquetexpress_label_request_function	08-01-2026 12:55:44:599 CST	info	trackingNumber 111232482498
paquetexpress_label_request_function	08-01-2026 12:55:44:405 CST	info	Execution started at:  1767898544404
paquetexpress_label_request_function	08-01-2026 12:39:33:526 CST	info	trackingNumber 111232479311
paquetexpress_label_request_function	08-01-2026 12:39:33:526 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232479311&measure=4x6
paquetexpress_label_request_function	08-01-2026 12:39:33:326 CST	info	Execution started at:  1767897573325
paquetexpress_label_request_function	08-01-2026 12:34:21:698 CST	info	trackingNumber 111232478601
paquetexpress_label_request_function	08-01-2026 12:34:21:698 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232478601&measure=4x6
paquetexpress_label_request_function	08-01-2026 12:34:21:502 CST	info	Execution started at:  1767897261501
paquetexpress_label_request_function	08-01-2026 11:54:37:323 CST	info	trackingNumber 211232472645
paquetexpress_label_request_function	08-01-2026 11:54:37:322 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232472645&measure=4x6
paquetexpress_label_request_function	08-01-2026 11:54:37:189 CST	info	Execution started at:  1767894877189
paquetexpress_label_request_function	08-01-2026 11:42:47:740 CST	info	trackingNumber 211232470358
paquetexpress_label_request_function	08-01-2026 11:42:47:739 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232470358&measure=4x6
paquetexpress_label_request_function	08-01-2026 11:42:47:539 CST	info	Execution started at:  1767894167539
paquetexpress_label_request_function	08-01-2026 11:37:44:935 CST	info	trackingNumber 211232469672
paquetexpress_label_request_function	08-01-2026 11:37:44:935 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232469672&measure=4x6
paquetexpress_label_request_function	08-01-2026 11:37:44:934 CST	info	Execution started at:  1767893864934
paquetexpress_label_request_function	08-01-2026 11:36:09:327 CST	info	trackingNumber 411232469497
paquetexpress_label_request_function	08-01-2026 11:36:09:327 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232469497&measure=4x6
paquetexpress_label_request_function	08-01-2026 11:36:09:135 CST	info	Execution started at:  1767893769134
paquetexpress_label_request_function	08-01-2026 10:48:48:470 CST	info	trackingNumber 211232463422
paquetexpress_label_request_function	08-01-2026 10:48:48:469 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232463422&measure=4x6
paquetexpress_label_request_function	08-01-2026 10:48:48:267 CST	info	Execution started at:  1767890928267
paquetexpress_label_request_function	08-01-2026 10:44:16:013 CST	info	trackingNumber 211232462917
paquetexpress_label_request_function	08-01-2026 10:44:16:012 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232462917&measure=4x6
paquetexpress_label_request_function	08-01-2026 10:44:15:816 CST	info	Execution started at:  1767890655815
paquetexpress_label_request_function	08-01-2026 10:40:53:876 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232462553&measure=4x6
paquetexpress_label_request_function	08-01-2026 10:40:53:876 CST	info	Execution started at:  1767890453876
paquetexpress_label_request_function	08-01-2026 10:40:53:876 CST	info	trackingNumber 211232462553
paquetexpress_label_request_function	08-01-2026 10:40:31:836 CST	info	trackingNumber 191232462505
paquetexpress_label_request_function	08-01-2026 10:40:31:836 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=191232462505&measure=4x6
paquetexpress_label_request_function	08-01-2026 10:40:31:625 CST	info	Execution started at:  1767890431624
paquetexpress_label_request_function	08-01-2026 10:35:58:520 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232462047&measure=4x6
paquetexpress_label_request_function	08-01-2026 10:35:58:520 CST	info	trackingNumber 211232462047
paquetexpress_label_request_function	08-01-2026 10:35:58:249 CST	info	Execution started at:  1767890158249
paquetexpress_label_request_function	08-01-2026 10:31:56:537 CST	info	trackingNumber 211232461576
paquetexpress_label_request_function	08-01-2026 10:31:56:537 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232461576&measure=4x6
paquetexpress_label_request_function	08-01-2026 10:31:56:330 CST	info	Execution started at:  1767889916329
paquetexpress_label_request_function	08-01-2026 10:28:05:900 CST	info	trackingNumber 211232461155
paquetexpress_label_request_function	08-01-2026 10:28:05:900 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232461155&measure=4x6
paquetexpress_label_request_function	08-01-2026 10:28:05:707 CST	info	Execution started at:  1767889685706
paquetexpress_label_request_function	08-01-2026 10:25:15:312 CST	info	Execution started at:  1767889515312
paquetexpress_label_request_function	08-01-2026 10:25:15:312 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232460818&measure=4x6
paquetexpress_label_request_function	08-01-2026 10:25:15:312 CST	info	trackingNumber 411232460818
paquetexpress_label_request_function	08-01-2026 10:23:55:735 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232460703&measure=4x6
paquetexpress_label_request_function	08-01-2026 10:23:55:735 CST	info	trackingNumber 211232460703
paquetexpress_label_request_function	08-01-2026 10:23:55:527 CST	info	Execution started at:  1767889435527
paquetexpress_label_request_function	08-01-2026 10:19:25:950 CST	info	trackingNumber 211232460067
paquetexpress_label_request_function	08-01-2026 10:19:25:950 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232460067&measure=4x6
paquetexpress_label_request_function	08-01-2026 10:19:25:747 CST	info	Execution started at:  1767889165747
paquetexpress_label_request_function	08-01-2026 10:14:51:989 CST	info	Execution started at:  1767888891989
paquetexpress_label_request_function	08-01-2026 10:14:51:989 CST	info	trackingNumber 211232459656
paquetexpress_label_request_function	08-01-2026 10:14:51:989 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232459656&measure=4x6
paquetexpress_label_request_function	08-01-2026 10:13:24:937 CST	info	trackingNumber 411232459289
paquetexpress_label_request_function	08-01-2026 10:13:24:937 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232459289&measure=4x6
paquetexpress_label_request_function	08-01-2026 10:13:24:734 CST	info	Execution started at:  1767888804734
paquetexpress_label_request_function	08-01-2026 10:11:09:018 CST	info	trackingNumber 211232459108
paquetexpress_label_request_function	08-01-2026 10:11:09:018 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232459108&measure=4x6
paquetexpress_label_request_function	08-01-2026 10:11:08:743 CST	info	Execution started at:  1767888668742
paquetexpress_label_request_function	08-01-2026 10:09:05:510 CST	info	trackingNumber 111232458700
paquetexpress_label_request_function	08-01-2026 10:09:05:510 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232458700&measure=4x6
paquetexpress_label_request_function	08-01-2026 10:09:05:408 CST	info	trackingNumber 111232458699
paquetexpress_label_request_function	08-01-2026 10:09:05:408 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232458699&measure=4x6
paquetexpress_label_request_function	08-01-2026 10:09:05:216 CST	info	Execution started at:  1767888545216
paquetexpress_label_request_function	08-01-2026 10:09:05:214 CST	info	Execution started at:  1767888545213
paquetexpress_label_request_function	08-01-2026 10:06:27:302 CST	info	Execution started at:  1767888387302
paquetexpress_label_request_function	08-01-2026 10:06:27:302 CST	info	trackingNumber 111232458416
paquetexpress_label_request_function	08-01-2026 10:06:27:302 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232458416&measure=4x6
paquetexpress_label_request_function	08-01-2026 10:05:47:042 CST	info	trackingNumber 411232458305
paquetexpress_label_request_function	08-01-2026 10:05:47:042 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232458305&measure=4x6
paquetexpress_label_request_function	08-01-2026 10:05:46:834 CST	info	Execution started at:  1767888346833
paquetexpress_label_request_function	08-01-2026 10:01:47:630 CST	info	trackingNumber 111232457912
paquetexpress_label_request_function	08-01-2026 10:01:47:630 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232457912&measure=4x6
paquetexpress_label_request_function	08-01-2026 10:01:47:427 CST	info	Execution started at:  1767888107427
paquetexpress_label_request_function	08-01-2026 09:55:46:928 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232457442&measure=4x6
paquetexpress_label_request_function	08-01-2026 09:55:46:928 CST	info	trackingNumber 111232457442
paquetexpress_label_request_function	08-01-2026 09:55:46:721 CST	info	Execution started at:  1767887746721
paquetexpress_label_request_function	08-01-2026 09:37:34:632 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232455994&measure=4x6
paquetexpress_label_request_function	08-01-2026 09:37:34:632 CST	info	trackingNumber 111232455994
paquetexpress_label_request_function	08-01-2026 09:37:34:423 CST	info	Execution started at:  1767886654423
paquetexpress_label_request_function	08-01-2026 09:27:11:730 CST	info	trackingNumber 111232454906
paquetexpress_label_request_function	08-01-2026 09:27:11:730 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232454906&measure=4x6
paquetexpress_label_request_function	08-01-2026 09:27:11:528 CST	info	Execution started at:  1767886031527
paquetexpress_label_request_function	08-01-2026 09:23:31:124 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232454516&measure=4x6
paquetexpress_label_request_function	08-01-2026 09:23:31:124 CST	info	trackingNumber 111232454516
paquetexpress_label_request_function	08-01-2026 09:23:30:918 CST	info	Execution started at:  1767885810917
paquetexpress_label_request_function	08-01-2026 09:19:26:644 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232454092&measure=4x6
paquetexpress_label_request_function	08-01-2026 09:19:26:644 CST	info	trackingNumber 111232454092
paquetexpress_label_request_function	08-01-2026 09:19:26:441 CST	info	Execution started at:  1767885566441
paquetexpress_label_request_function	08-01-2026 09:08:00:646 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232453164&measure=4x6
paquetexpress_label_request_function	08-01-2026 09:08:00:646 CST	info	trackingNumber 111232453164
paquetexpress_label_request_function	08-01-2026 09:08:00:541 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232453165&measure=4x6
paquetexpress_label_request_function	08-01-2026 09:08:00:541 CST	info	trackingNumber 111232453165
paquetexpress_label_request_function	08-01-2026 09:08:00:330 CST	info	Execution started at:  1767884880330
paquetexpress_label_request_function	08-01-2026 09:08:00:328 CST	info	Execution started at:  1767884880328
paquetexpress_label_request_function	07-01-2026 22:51:31:318 CST	info	Execution started at:  1767847891318
paquetexpress_label_request_function	07-01-2026 22:51:31:318 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232446277&measure=4x6
paquetexpress_label_request_function	07-01-2026 22:51:31:318 CST	info	trackingNumber 411232446277
paquetexpress_label_request_function	07-01-2026 22:51:31:252 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232446279&measure=4x6
paquetexpress_label_request_function	07-01-2026 22:51:31:252 CST	info	trackingNumber 411232446279
paquetexpress_label_request_function	07-01-2026 22:51:31:146 CST	info	trackingNumber 411232446278
paquetexpress_label_request_function	07-01-2026 22:51:31:146 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232446278&measure=4x6
paquetexpress_label_request_function	07-01-2026 22:51:30:938 CST	info	Execution started at:  1767847890938
paquetexpress_label_request_function	07-01-2026 22:51:30:937 CST	info	Execution started at:  1767847890937
paquetexpress_label_request_function	07-01-2026 22:36:21:896 CST	info	trackingNumber 411232445987
paquetexpress_label_request_function	07-01-2026 22:36:21:896 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232445987&measure=4x6
paquetexpress_label_request_function	07-01-2026 22:36:21:699 CST	info	Execution started at:  1767846981699
paquetexpress_label_request_function	07-01-2026 16:55:00:745 CST	info	trackingNumber 111232421036
paquetexpress_label_request_function	07-01-2026 16:55:00:745 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232421036&measure=4x6
paquetexpress_label_request_function	07-01-2026 16:55:00:542 CST	info	Execution started at:  1767826500542
paquetexpress_label_request_function	07-01-2026 14:12:10:848 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=191232397497&measure=4x6
paquetexpress_label_request_function	07-01-2026 14:12:10:848 CST	info	trackingNumber 191232397497
paquetexpress_label_request_function	07-01-2026 14:12:10:638 CST	info	Execution started at:  1767816730638
paquetexpress_label_request_function	07-01-2026 13:16:31:727 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232389611&measure=4x6
paquetexpress_label_request_function	07-01-2026 13:16:31:727 CST	info	trackingNumber 111232389611
paquetexpress_label_request_function	07-01-2026 13:16:31:521 CST	info	Execution started at:  1767813391521
paquetexpress_label_request_function	07-01-2026 12:59:54:928 CST	info	trackingNumber 111232387327
paquetexpress_label_request_function	07-01-2026 12:59:54:928 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232387327&measure=4x6
paquetexpress_label_request_function	07-01-2026 12:59:54:654 CST	info	Execution started at:  1767812394654
paquetexpress_label_request_function	07-01-2026 12:30:02:691 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232382359&measure=4x6
paquetexpress_label_request_function	07-01-2026 12:30:02:691 CST	info	trackingNumber 211232382359
paquetexpress_label_request_function	07-01-2026 12:30:02:489 CST	info	Execution started at:  1767810602488
paquetexpress_label_request_function	07-01-2026 12:14:26:324 CST	info	trackingNumber 211232380271
paquetexpress_label_request_function	07-01-2026 12:14:26:323 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232380271&measure=4x6
paquetexpress_label_request_function	07-01-2026 12:14:26:053 CST	info	Execution started at:  1767809666052
paquetexpress_label_request_function	07-01-2026 10:49:24:735 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232369523&measure=4x6
paquetexpress_label_request_function	07-01-2026 10:49:24:735 CST	info	trackingNumber 411232369523
paquetexpress_label_request_function	07-01-2026 10:49:24:530 CST	info	Execution started at:  1767804564529
paquetexpress_label_request_function	07-01-2026 10:43:56:634 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232368945&measure=4x6
paquetexpress_label_request_function	07-01-2026 10:43:56:634 CST	info	trackingNumber 411232368945
paquetexpress_label_request_function	07-01-2026 10:43:56:431 CST	info	Execution started at:  1767804236430
paquetexpress_label_request_function	07-01-2026 10:36:56:033 CST	info	trackingNumber 411232368109
paquetexpress_label_request_function	07-01-2026 10:36:56:033 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=411232368109&measure=4x6
paquetexpress_label_request_function	07-01-2026 10:36:55:825 CST	info	Execution started at:  1767803815825
paquetexpress_label_request_function	07-01-2026 10:33:56:619 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232367829&measure=4x6
paquetexpress_label_request_function	07-01-2026 10:33:56:619 CST	info	trackingNumber 111232367829
paquetexpress_label_request_function	07-01-2026 10:33:56:418 CST	info	Execution started at:  1767803636418
paquetexpress_label_request_function	07-01-2026 10:18:34:738 CST	info	trackingNumber 111232366504
paquetexpress_label_request_function	07-01-2026 10:18:34:738 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=111232366504&measure=4x6
paquetexpress_label_request_function	07-01-2026 10:18:34:531 CST	info	Execution started at:  1767802714530
paquetexpress_label_request_function	07-01-2026 09:35:04:927 CST	info	trackingNumber 211232362882
paquetexpress_label_request_function	07-01-2026 09:35:04:927 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232362882&measure=4x6
paquetexpress_label_request_function	07-01-2026 09:35:04:726 CST	info	Execution started at:  1767800104725
paquetexpress_label_request_function	07-01-2026 09:28:16:129 CST	info	trackingNumber 211232362305
paquetexpress_label_request_function	07-01-2026 09:28:16:129 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232362305&measure=4x6
paquetexpress_label_request_function	07-01-2026 09:28:15:918 CST	info	Execution started at:  1767799695850
paquetexpress_label_request_function	07-01-2026 09:23:57:435 CST	info	trackingNumber 211232361921
paquetexpress_label_request_function	07-01-2026 09:23:57:434 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232361921&measure=4x6
paquetexpress_label_request_function	07-01-2026 09:23:57:229 CST	info	Execution started at:  1767799437228
paquetexpress_label_request_function	07-01-2026 09:12:49:930 CST	info	trackingNumber 211232361132
paquetexpress_label_request_function	07-01-2026 09:12:49:930 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232361132&measure=4x6
paquetexpress_label_request_function	07-01-2026 09:12:49:729 CST	info	Execution started at:  1767798769728
paquetexpress_label_request_function	07-01-2026 09:10:04:936 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232360840&measure=4x6
paquetexpress_label_request_function	07-01-2026 09:10:04:936 CST	info	trackingNumber 211232360840
paquetexpress_label_request_function	07-01-2026 09:10:04:732 CST	info	Execution started at:  1767798604731
paquetexpress_label_request_function	07-01-2026 09:06:40:934 CST	info	trackingNumber 211232360641
paquetexpress_label_request_function	07-01-2026 09:06:40:933 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232360641&measure=4x6
paquetexpress_label_request_function	07-01-2026 09:06:40:728 CST	info	Execution started at:  1767798400727
paquetexpress_label_request_function	07-01-2026 09:03:22:300 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232360470&measure=4x6
paquetexpress_label_request_function	07-01-2026 09:03:22:300 CST	info	trackingNumber 211232360470
paquetexpress_label_request_function	07-01-2026 09:03:22:114 CST	info	Execution started at:  1767798202114
paquetexpress_label_request_function	07-01-2026 09:00:25:931 CST	info	trackingNumber 211232360342
paquetexpress_label_request_function	07-01-2026 09:00:25:931 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232360342&measure=4x6
paquetexpress_label_request_function	07-01-2026 09:00:25:725 CST	info	Execution started at:  1767798025725
paquetexpress_label_request_function	07-01-2026 08:56:48:092 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232360161&measure=4x6
paquetexpress_label_request_function	07-01-2026 08:56:48:092 CST	info	trackingNumber 211232360161
paquetexpress_label_request_function	07-01-2026 08:56:47:910 CST	info	Execution started at:  1767797807910
paquetexpress_label_request_function	07-01-2026 08:54:00:676 CST	info	trackingNumber 211232360053
paquetexpress_label_request_function	07-01-2026 08:54:00:676 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232360053&measure=4x6
paquetexpress_label_request_function	07-01-2026 08:54:00:476 CST	info	Execution started at:  1767797640475
paquetexpress_label_request_function	07-01-2026 08:46:55:722 CST	info	trackingNumber 211232359799
paquetexpress_label_request_function	07-01-2026 08:46:55:722 CST	info	labelUrl https://cc.paquetexpress.com.mx:8082/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=211232359799&measure=4x6
paquetexpress_label_request_function	07-01-2026 08:46:55:452 CST	info	Execution started at:  1767797215451
"""

UMBRAL_SEGUNDOS = 3  # Subí un poco el margen por si acaso
BUSCAR_CONSECUTIVOS = False 

def analizar_logs(log_text):
    print("Analizando texto...")
    
    # --- CAMBIO IMPORTANTE EN EL REGEX ---
    # \s* permite espacios o tabs entre las columnas.
    # Estructura esperada: ResourceName + (espacios) + FECHA + (espacios) + CST/Level + (espacios) + MENSAJE
    patron = re.compile(r"paquetexpress_label_request_function\s*(\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}:\d{3}).*?info\s*(.*?)(?=paquetexpress_label_request_function|$)", re.DOTALL)
    
    coincidencias = patron.findall(log_text)
    datos = []

    print(f"Líneas brutas encontradas: {len(coincidencias)}")

    for fecha_str, mensaje in coincidencias:
        mensaje = mensaje.strip()
        
        # Buscar el tracking number dentro del mensaje
        match_guia = re.search(r"trackingNumber\s+(\d+)", mensaje)
        
        if match_guia:
            try:
                # Parsear fecha: 07-01-2026 08:54:00:676
                fecha = datetime.strptime(fecha_str, "%d-%m-%Y %H:%M:%S:%f")
                guia = int(match_guia.group(1))
                datos.append({'fecha': fecha, 'guia': guia})
            except ValueError:
                continue

    if not datos:
        print("❌ No encontré guías. Verifica si el formato de fecha o nombre de función cambió.")
        return pd.DataFrame()

    df = pd.DataFrame(datos)
    # Ordenar por fecha para poder comparar tiempos
    df = df.sort_values('fecha').reset_index(drop=True)
    
    posibles_duplicados = []

    # Algoritmo de comparación
    for i in range(len(df)):
        fila_actual = df.iloc[i]
        
        # Comparar contra las siguientes filas
        for j in range(i + 1, len(df)):
            fila_siguiente = df.iloc[j]
            
            delta_tiempo = (fila_siguiente['fecha'] - fila_actual['fecha']).total_seconds()
            
            # Si la diferencia es mayor al umbral, dejamos de buscar en este bloque
            if delta_tiempo > UMBRAL_SEGUNDOS:
                break
            
            # Lógica de detección
            es_sospechoso = False
            diff_guias = abs(fila_siguiente['guia'] - fila_actual['guia'])

            # Criterio: Si se crearon en menos de X segundos y NO son el mismo número exacto
            # (El mismo número exacto podría ser un log duplicado, no una guía duplicada)
            if diff_guias > 0:
                es_sospechoso = True

            if es_sospechoso:
                posibles_duplicados.append({
                    'Fecha Guía 1 (Vieja)': fila_actual['fecha'],
                    'Guía 1': fila_actual['guia'],
                    'Fecha Guía 2 (Nueva)': fila_siguiente['fecha'],
                    'Guía 2': fila_siguiente['guia'],
                    'Diferencia (seg)': round(delta_tiempo, 3),
                    'Son Consecutivas': 'SÍ' if diff_guias == 1 else 'NO'
                })

    return pd.DataFrame(posibles_duplicados)


df_resultados = analizar_logs(raw_logs)

if not df_resultados.empty:
    pd.set_option('display.max_columns', None)
    pd.set_option('display.width', 1000)
    print(df_resultados)
    
    # Generar CSV para enviarlo
    df_resultados.to_excel('reporte_guias_duplicadas.xlsx', index=False)
    print("\n📄 Archivo 'reporte_guias_duplicadas.xlsx' generado con éxito.")
else:
    print("\n✅ Todo limpio. No se encontraron duplicados en el rango analizado.")