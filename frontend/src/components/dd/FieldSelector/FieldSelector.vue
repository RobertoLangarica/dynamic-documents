<template>
  <q-list>
    <template v-for="(item, index) in items">
      <q-separator spaced v-if="index > 0 && item.group" :key="`space_${index}`" />
      <span :key="item.key">
        <q-item-label v-if="item.group" header>{{ item.name }}</q-item-label>
        <q-item v-else tag="label" v-ripple>
          <q-checkbox v-model="item.selected" :label="item.name" />
        </q-item>
      </span>
    </template>
  </q-list>
</template>

<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator'
import { DDField } from 'src/dynamic-documents/src/core/DDField';
import { mixins } from 'vue-class-component';
import EmbedMixin from 'src/pages/embeds/EmbedMixin';

interface IFieldItem{
    name:string;
    group:boolean;
    field?:DDField;
    fields?:IFieldItem[];
    selected?:boolean;
    key:string;
}
@Component({})
export default class FieldSelector extends mixins(EmbedMixin) {
    @Prop({ required: false }) readonly fields!:DDField[]

    fieldsData:DDField[] = []
    items:IFieldItem[] = []

    mounted () {
      this.fieldsData = this.fields || []
    }

    @Watch('fieldsData', { immediate: true })
    sortFieldsInGroups (fields) {
      this.items = []
      if (!fields) { return }
      let general:IFieldItem = { name: 'Generales', fields: [], group: true, key: 'general_group' }
      let groups:{[key:string] : IFieldItem;} = {}
      let sortedGroups:IFieldItem[] = []
      let defaultGroup:IFieldItem = { name: '', fields: [], group: true, key: 'pending' }

      fields.forEach(f => {
        if (DDField.isGroup(f)) {
          // the group could exists before this field since it is referenced by other fields
          if (!groups[f.id]) {
            groups[f.id] = Object.assign({}, defaultGroup) as any
          }

          groups[f.id].name = f.name
          groups[f.id].key = f.id

          sortedGroups.push(groups[f.id])
        } else if (!f.group_by) {
            general.fields!.push({ name: f.name, field: f, group: false, selected: false, key: f.id })
        } else {
          let g = f.group_by

          if (!groups[g]) {
            groups[f.id] = Object.assign({}, defaultGroup) as any
          }
            groups[g].fields!.push({ name: f.name, field: f, group: false, selected: false, key: f.id })
        }
      })

      this.items = []

      // Fields without group
      this.items.push(general)
        general.fields!.forEach(i => {
          this.items.push(i)
        })

        // Fields within a group
        sortedGroups.forEach(i => {
          this.items.push(i)
            i.fields!.forEach(ii => {
              this.items.push(ii)
            })
        })
    }

    get embedded () {
      // @ts-ignore
      return this.$root.invisibleDialogs
    }

    getSelected () {
      return this.items.filter(i => i.selected).map(f => f.field)
    }

    async onMessage (message, data, handled = false) {
      switch (message) {
        case 'set_fields':
          handled = true
          this.fieldsData = data
          break;
        case 'get_selected':
          handled = true
          this.sendMessage('selected', this.getSelected())
          break;
        default:
          if (!handled) {
            console.log(`Unrecognized event->${message}`)
          }
      }
    }
}
</script>
