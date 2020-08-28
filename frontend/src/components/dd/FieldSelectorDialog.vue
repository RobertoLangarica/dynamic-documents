<template>
  <q-dialog ref="dialog">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <span class="text-h6">{{ title }}</span>
      </q-card-section>
      <q-card-section>
        <q-scroll-area class="dialog-scroll-list">
          <q-list bordered>
            <template v-for="(item, index) in items">
              <q-separator spaced v-if="index > 0 && item.group" :key="`space_${index}`" />

              <q-item-label v-if="item.group" header :key="index">{{ item.name }}</q-item-label>
              <q-item v-else tag="label" v-ripple :key="index">
                <q-item-section side>
                  <q-checkbox v-model="item.selected" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ item.name }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-list>
        </q-scroll-area>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat rounded color="secondary" label="Cancelar" @click="onClose" />
        <q-btn rounded color="primary" label="Aceptar" @click="onSelect" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { QDialog } from 'quasar'
import { DDField } from 'src/dynamic-documents/src/core/DDField';

interface IFieldItem{
    name:string;
    group:boolean;
    field?:DDField;
    fields?:IFieldItem[];
    selected?:boolean;
}
@Component({})
export default class FieldSelectorDialog extends Vue {
    @Prop({ required: false, default: 'Elige un campo' }) readonly title!: string;
    @Prop({ required: true }) readonly fields!:DDField[]

    items:IFieldItem[] = []

    mounted () {
      this.sortFieldsInGroups()
    }

    sortFieldsInGroups () {
      let general:IFieldItem = { name: 'Generales', fields: [], group: true }
      let groups:{[key:string] : IFieldItem;} = {}
      let sortedGroups:IFieldItem[] = []
      this.items = []

      this.fields.forEach(f => {
        if (DDField.isGroup(f)) {
          if (!groups[f.id]) {
            groups[f.id] = { name: '', fields: [], group: true }
          }

          groups[f.id].name = f.name;
          sortedGroups.push(groups[f.id])
        } else if (!f.group_by || f.group_by === '') {
                general.fields!.push({ name: f.name, field: f, group: false, selected: false })
        } else {
          let g = f.group_by

          if (!groups[g]) {
            groups[g] = { name: '', fields: [], group: true }
          }
                groups[g].fields!.push({ name: f.name, field: f, group: false, selected: false })
        }
      })

      // First the fields without group
      this.items.push(general)
        general.fields!.forEach(i => {
          this.items.push(i)
        })

        // Fields with group
        sortedGroups.forEach(i => {
          this.items.push(i)
            i.fields!.forEach(ii => {
              this.items.push(ii)
            })
        })
    }

    show () {
      (this.$refs.dialog as QDialog).show()
    }

    hide () {
      (this.$refs.dialog as QDialog).hide()
    }

    onSelect () {
      let selected = this.items.filter(i => i.selected).map(f => f.field)
      this.$emit('ok', selected)
      this.hide()
    }

    onClose () {
      this.hide()
    }
}
</script>
