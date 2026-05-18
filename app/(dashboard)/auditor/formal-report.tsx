import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function FormalReportPreviewScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={16} color="#0f172a" />
          <Text style={styles.backText}>Back to Dashboard</Text>
        </Pressable>
        <View style={styles.actions}>
          <Pressable style={styles.printBtn} onPress={() => { if (typeof window !== 'undefined') window.print(); }}>
            <Feather name="printer" size={16} color="#fff" />
            <Text style={styles.printBtnText}>Print / Save PDF</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.document, isMobile && { width: '100%', padding: 20 }]}>
          
          {/* Header */}
          <Text style={styles.headerTitle}>MAHARASHTRA POLLUTION CONTROL BOARD</Text>
          
          <View style={styles.headerInfo}>
            <View style={styles.headerCol1}>
              <Text style={styles.docText}>Tel: 022 27572740</Text>
              <Text style={styles.docText}>Fax: 022 27571586</Text>
              <Text style={styles.docText}>Website: http://mpcb.gov.in</Text>
              <Text style={styles.docText}>Email: sronavimumbai2@mpcb.gov.in</Text>
            </View>
            <View style={styles.headerCol2}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>महाराष्ट्र</Text>
              </View>
            </View>
            <View style={styles.headerCol3}>
              <Text style={styles.docText}>Raigad Bhavan, 7th floor</Text>
              <Text style={styles.docText}>Sector - 11, C.B.D Belapur,</Text>
              <Text style={styles.docText}>Navi Mumbai</Text>
            </View>
          </View>
          
          <View style={styles.divider} />

          {/* Reference Info */}
          <View style={styles.refRow}>
            <Text style={styles.boldText}>GREEN/S.S.I ()/ Rev. /I.S./(51)</Text>
            <Text style={styles.boldText}>Date: 18/05/2026</Text>
          </View>
          <Text style={styles.boldText}>No:- Format1.0/SRO/UAN No.MPCB-CONSENT-0000285785/CR/2605002529</Text>

          {/* Addressee */}
          <View style={styles.addressRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.boldText}>To,</Text>
              <Text style={styles.boldText}>M/s. SEPARATION TECHNIQUES PVT. LTD.</Text>
              <Text style={styles.boldText}>Plot No. R-505, TTC Indl. Area,</Text>
              <Text style={styles.boldText}>MIDC Rabale, Navi Mumbai.</Text>
            </View>
            <View style={styles.stampBox}>
              <Text style={{ fontSize: 10, color: 'green', fontWeight: 'bold' }}>LiFE</Text>
              <Text style={{ fontSize: 8, color: 'red' }}>Your Service is Our Duty</Text>
            </View>
          </View>

          {/* Subject & Reference */}
          <View style={styles.subRefBox}>
            <View style={styles.subRow}>
              <Text style={styles.boldText}>Sub:</Text>
              <Text style={[styles.boldText, { flex: 1, marginLeft: 20 }]}>Renewal of Consent to Operate under Green Category.</Text>
            </View>
            <View style={[styles.subRow, { marginTop: 10, alignItems: 'flex-start' }]}>
              <Text style={styles.boldText}>Ref:</Text>
              <Text style={[styles.docText, { flex: 1, marginLeft: 20 }]}>
                Consent to operate granted vide No:- Format1.0/SRO/UAN No.0000165482/CR/2304000911 Date: 13/04/2023 valid upto 31/05/2026.
              </Text>
            </View>
          </View>

          {/* Body Paragraph */}
          <Text style={[styles.docText, { marginTop: 20 }]}>Your application No.MPCB-CONSENT-0000285785 Dated 18.04.2026</Text>
          <Text style={[styles.docText, { marginTop: 10, textAlign: 'justify' }]}>
            For: grant of Consent to Operate under Section 26 of the Water (Prevention & Control of Pollution) Act, 1974 & under Section 21 of the Air (Prevention & Control of Pollution) Act, 1981 and Authorization under Rule 6 and Rule 18(7) of the Hazardous & Other Wastes (Management & Transboundary Movement) Rules 2016 is considered and the consent is hereby granted subject to the following terms and conditions and as detailed in the schedule I, II, III & IV annexed to this order:
          </Text>

          {/* Numbered List */}
          <View style={styles.list}>
            <View style={styles.listItem}>
              <Text style={styles.listNumber}>1.</Text>
              <Text style={styles.listContentBold}>The consent to renewal is granted for a period up to 31/05/2032</Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.listNumber}>2.</Text>
              <Text style={styles.listContentBold}>The capital investment of the project is Rs.4.6724 Crs. (As per C.A Certificate submitted by industry )</Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.listNumber}>3.</Text>
              <Text style={styles.listContentBold}>Consent is valid for the manufacture of:</Text>
            </View>
          </View>

          {/* Table 1: Products */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { width: 50 }]}>Sr No</Text>
              <Text style={[styles.th, { flex: 1 }]}>Product</Text>
              <Text style={[styles.th, { width: 120 }]}>Maximum Quantity</Text>
              <Text style={[styles.th, { width: 80 }]}>UOM</Text>
            </View>
            <View style={styles.tr}>
              <Text style={[styles.td, { flex: 1 }]}>Products</Text>
            </View>
            {[
              { sr: 1, prod: 'Gyroscreen/ Screening Machines.', qty: 45, uom: 'No/M' },
              { sr: 2, prod: 'Gyroscreen Spares', qty: 2000, uom: 'No/M' },
              { sr: 3, prod: 'Centrifuge', qty: 1, uom: 'No/M' },
              { sr: 4, prod: 'Sparkler Filter', qty: 1, uom: 'No/M' },
            ].map((r, i) => (
              <View key={i} style={styles.tr}>
                <Text style={[styles.td, { width: 50, textAlign: 'center' }]}>{r.sr}</Text>
                <Text style={[styles.td, { flex: 1 }]}>{r.prod}</Text>
                <Text style={[styles.td, { width: 120, textAlign: 'center' }]}>{r.qty}</Text>
                <Text style={[styles.td, { width: 80, textAlign: 'center' }]}>{r.uom}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.docText, { marginTop: 8 }]}>
            (By Engineering fabrication & Assembling only, Without Surface treatment, Heat Treatment, Pickling, Painting, Phosphating and Electroplating activity)
          </Text>

          {/* Water Conditions */}
          <View style={[styles.listItem, { marginTop: 16 }]}>
            <Text style={styles.listNumber}>4.</Text>
            <Text style={styles.listContentBold}>Conditions under Water (P&CP), 1974 Act for discharge of effluent:</Text>
          </View>
          
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { width: 50 }]}>Sr No</Text>
              <Text style={[styles.th, { flex: 1 }]}>Description</Text>
              <Text style={[styles.th, { width: 120 }]}>Permitted (in CMD)</Text>
              <Text style={[styles.th, { width: 120 }]}>Standards to</Text>
              <Text style={[styles.th, { flex: 1 }]}>Disposal Path</Text>
            </View>
            <View style={styles.tr}>
              <Text style={[styles.td, { width: 50, textAlign: 'center' }]}>1.</Text>
              <Text style={[styles.td, { flex: 1 }]}>Trade effluent</Text>
              <Text style={[styles.td, { width: 120, textAlign: 'center' }]}>0.0</Text>
              <Text style={[styles.td, { width: 120 }]}>As per Schedule-I</Text>
              <Text style={[styles.td, { flex: 1 }]}>Not Applicable</Text>
            </View>
            <View style={styles.tr}>
              <Text style={[styles.td, { width: 50, textAlign: 'center' }]}>2.</Text>
              <Text style={[styles.td, { flex: 1 }]}>Domestic effluent</Text>
              <Text style={[styles.td, { width: 120, textAlign: 'center' }]}>0.8</Text>
              <Text style={[styles.td, { width: 120 }]}>As per Schedule-I</Text>
              <Text style={[styles.td, { flex: 1 }]}>On land for gardening</Text>
            </View>
          </View>

          {/* Air Conditions */}
          <View style={[styles.listItem, { marginTop: 16 }]}>
            <Text style={styles.listNumber}>5.</Text>
            <Text style={styles.listContentBold}>Conditions under Air (P& CP) Act, 1981 for air emissions:</Text>
          </View>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { width: 50 }]}>Sr No.</Text>
              <Text style={[styles.th, { width: 80 }]}>Stack No.</Text>
              <Text style={[styles.th, { flex: 1 }]}>Description of stack / source</Text>
              <Text style={[styles.th, { width: 100 }]}>Number of Stack</Text>
              <Text style={[styles.th, { flex: 1 }]}>Standards to be achieved</Text>
            </View>
            <View style={styles.tr}>
              <Text style={[styles.td, { width: 50, textAlign: 'center' }]}>1</Text>
              <Text style={[styles.td, { width: 80, textAlign: 'center' }]}>N. A.</Text>
              <Text style={[styles.td, { flex: 1 }]}>N. A.</Text>
              <Text style={[styles.td, { width: 100, textAlign: 'center' }]}>0</Text>
              <Text style={[styles.td, { flex: 1 }]}>As per Schedule -II</Text>
            </View>
          </View>

          {/* Footer signature / end of page marker */}
          <View style={{ marginTop: 60, borderTopWidth: 1, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 9, fontWeight: '700' }}>SEPARATION TECHNIQUES PVT. LTD./CR/UAN No.MPCB-CONSENT-0000285785</Text>
            <Text style={{ fontSize: 9 }}>Page 1 of 10</Text>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  topBar: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    backgroundColor: '#fff', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' 
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backText: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  actions: { flexDirection: 'row', gap: 12 },
  printBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  printBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  scroll: { flex: 1, padding: 20 },
  document: {
    backgroundColor: '#fff',
    width: 800,
    minHeight: 1120,
    alignSelf: 'center',
    padding: 60,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0284c7', // MPCB Blue
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  headerInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerCol1: { flex: 1 },
  headerCol2: { flex: 1, alignItems: 'center' },
  headerCol3: { flex: 1, alignItems: 'flex-end' },
  docText: { fontSize: 13, color: '#000', lineHeight: 18, fontFamily: 'Arial' },
  boldText: { fontSize: 13, fontWeight: 'bold', color: '#000', lineHeight: 20, fontFamily: 'Arial' },
  logoCircle: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: '#0284c7', justifyContent: 'center', alignItems: 'center' },
  logoText: { color: '#0284c7', fontSize: 11, fontWeight: 'bold' },
  divider: { height: 2, backgroundColor: '#000', marginVertical: 16 },
  refRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  addressRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, alignItems: 'flex-start' },
  stampBox: { borderWidth: 1, borderColor: '#e5e7eb', padding: 8, alignItems: 'center', width: 140 },
  subRefBox: { marginTop: 30, paddingLeft: 40 },
  subRow: { flexDirection: 'row', alignItems: 'center' },
  list: { marginTop: 20 },
  listItem: { flexDirection: 'row', marginBottom: 8, paddingRight: 20 },
  listNumber: { width: 30, fontSize: 13, fontWeight: 'bold' },
  listContentBold: { fontSize: 13, fontWeight: 'bold', flex: 1, lineHeight: 20 },
  table: { borderWidth: 1, borderColor: '#000', marginTop: 10 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#0284c7', borderBottomWidth: 1, borderColor: '#000' },
  th: { padding: 8, fontSize: 12, fontWeight: 'bold', color: '#fff', borderRightWidth: 1, borderColor: '#000', textAlign: 'center', fontStyle: 'italic' },
  tr: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000' },
  td: { padding: 8, fontSize: 12, color: '#000', borderRightWidth: 1, borderColor: '#000' },
});
